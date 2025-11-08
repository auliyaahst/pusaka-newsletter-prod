import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Configure NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 60000, // Increased to 60 seconds for better reliability
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Authorize called with email:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          throw new Error("Invalid credentials")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log("👤 User found:", user ? "Yes" : "No")

          if (!user) {
            console.log("❌ User not found")
            throw new Error("Invalid credentials")
          }

          // Check for OTP-verified login (special case)
          if (credentials.password === 'verified') {
            console.log("🔓 OTP-verified login detected")
            if (!user.isVerified) {
              console.log("❌ User not verified")
              throw new Error("Account not verified")
            }
            if (!user.isActive) {
              console.log("❌ User not active")
              throw new Error("Account is not active")
            }
            console.log("✅ OTP-verified authentication successful for:", user.email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isActive: user.isActive,
              isVerified: user.isVerified,
            }
          }

          // Regular password login
          if (!user.password) {
            console.log("❌ No password set")
            throw new Error("Invalid credentials")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("🔑 Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            throw new Error("Invalid credentials")
          }

          if (!user.isActive) {
            console.log("❌ User not active")
            throw new Error("Account is not active")
          }

          console.log("✅ Authentication successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
          }
        } catch (error) {
          console.error("💥 Auth error:", error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback started:', { 
        email: user.email, 
        provider: account?.provider,
        profileEmail: profile?.email,
        timestamp: new Date().toISOString()
      })
      
      if (account?.provider === 'google') {
        try {
          const startTime = Date.now()
          
          // Find existing user in database with optimized query
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              image: true,
              isActive: true,
              isVerified: true
            }
          })
          
          console.log('👤 Google OAuth - User lookup completed:', { 
            email: user.email, 
            userExists: !!existingUser,
            userRole: existingUser?.role,
            duration: `${Date.now() - startTime}ms`
          })
          
          if (!existingUser) {
            console.log('❌ Google OAuth - User not found in database')
            return false // Don't allow login if user doesn't exist
          }

          // Only update if data has changed to avoid unnecessary DB writes
          const needsUpdate = 
            user.name !== existingUser.name || 
            user.image !== existingUser.image || 
            !existingUser.isVerified

          if (needsUpdate) {
            const updateStart = Date.now()
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                isVerified: true
              }
            })
            console.log('✅ Google OAuth - User updated:', {
              duration: `${Date.now() - updateStart}ms`
            })
          } else {
            console.log('ℹ️ Google OAuth - No update needed')
          }
          
          console.log('✅ Google OAuth - SignIn callback completed:', {
            totalDuration: `${Date.now() - startTime}ms`
          })
          return true
          
        } catch (error) {
          console.error('❌ Google OAuth error:', error)
          // Enhanced error logging for debugging timeout issues
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            })
          }
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      console.log('🔑 NextAuth JWT callback:', { 
        hasUser: !!user, 
        tokenId: token.id, 
        userRole: user?.role,
        tokenRole: token.role,
        provider: account?.provider 
      })
      
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
        token.isVerified = user.isVerified
        console.log('✅ JWT token updated with user data:', { 
          id: token.id, 
          role: token.role,
          isActive: token.isActive 
        })
      } else if (token.email && !token.role) {
        // Fetch role from database if not in token (for Google OAuth)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true, isActive: true, isVerified: true }
          })
          
          console.log('🔍 JWT - Fetched user from DB:', { 
            email: token.email, 
            role: dbUser?.role,
            isActive: dbUser?.isActive 
          })
          
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.isActive = dbUser.isActive
            token.isVerified = dbUser.isVerified
            console.log('✅ JWT token updated with DB data:', { id: token.id, role: token.role })
          }
        } catch (error) {
          console.error('❌ JWT DB lookup error:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('👤 NextAuth session callback:', { 
        hasToken: !!token, 
        hasSessionUser: !!session.user,
        tokenId: token.id,
        tokenRole: token.role,
        tokenIsActive: token.isActive 
      })
      if (token && session.user) {
        session.user.id = String(token.id)
        session.user.role = String(token.role)
        session.user.isActive = Boolean(token.isActive)
        session.user.isVerified = Boolean(token.isVerified)
        console.log('✅ Session updated with token data:', { 
          userId: session.user.id, 
          userRole: session.user.role,
          userEmail: session.user.email,
          isActive: session.user.isActive 
        })
      }
      return session
    },
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error("NextAuth Error:", code, ...message)
    },
    warn(code, ...message) {
      console.warn("NextAuth Warning:", code, ...message)
    },
    debug(code, ...message) {
      console.debug("NextAuth Debug:", code, ...message)
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)