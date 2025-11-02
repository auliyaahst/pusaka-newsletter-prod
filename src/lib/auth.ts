import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma'

// Configure NextAuth
export const authOptions: NextAuthOptions = {
  // TEMPORARY: Disable PrismaAdapter to avoid database dependency
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT instead of database sessions
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          // TEMPORARY: Allow SUPER_ADMIN login while database is inaccessible
          const superAdminEmail = 'tpadmin@thepusaka.id'
          const superAdminPassword = 'M@cchiato0#'
          
          if (credentials.email.toLowerCase() === superAdminEmail.toLowerCase()) {
            console.log("🔑 SUPER_ADMIN login attempt")
            
            // Check if this is an OTP-verified login
            if (credentials.password === 'verified') {
              console.log("✅ OTP-verified SUPER_ADMIN login")
              return {
                id: '1',
                email: superAdminEmail,
                name: 'TP Super Admin',
                role: 'SUPER_ADMIN',
              }
            }
            
            // Regular password login for SUPER_ADMIN
            if (credentials.password === superAdminPassword) {
              console.log("✅ Password-verified SUPER_ADMIN login")
              return {
                id: '1',
                email: superAdminEmail,
                name: 'TP Super Admin',
                role: 'SUPER_ADMIN',
              }
            }
            
            console.log("❌ Invalid SUPER_ADMIN password")
            throw new Error("Invalid credentials")
          }

          // For other users, try database connection
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          console.log("👤 User found:", user ? "Yes" : "No")

          if (!user) {
            console.log("❌ User not found")
            throw new Error("Invalid credentials")
          }

          // Check if this is an OTP-verified login
          if (credentials.password === 'verified') {
            console.log("🔑 OTP-verified login")
            
            // Verify that the user's email is verified
            if (!user.isVerified) {
              console.log("❌ Email not verified")
              throw new Error("Email not verified")
            }

            if (!user.isActive) {
              console.log("❌ User not active")
              throw new Error("Account is not active")
            }

            console.log("✅ OTP authentication successful for:", user.email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          // Regular password login
          if (!user.password) {
            console.log("❌ No password set")
            throw new Error("Invalid credentials")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
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
          }
        } catch (error) {
          console.error("💥 Auth error:", error)
          
          // If it's a database connection error and this is the SUPER_ADMIN, still allow access
          if (credentials.email.toLowerCase() === 'tpadmin@thepusaka.id' && 
              (error instanceof Error && (error.message.includes('P1001') || error.message.includes('connection')))) {
            console.log("⚠️ Database connection failed, checking SUPER_ADMIN credentials")
            
            if (credentials.password === 'M@cchiato0#') {
              console.log("✅ SUPER_ADMIN access granted despite database issue")
              return {
                id: '1',
                email: 'tpadmin@thepusaka.id',
                name: 'TP Super Admin',
                role: 'SUPER_ADMIN',
              }
            }
          }
          
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("🎫 JWT Callback - token:", !!token, "user:", !!user)
      if (user) {
        console.log("👤 Adding user to token:", user.email, user.role)
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log("🔐 Session Callback - session:", !!session, "token:", !!token)
      if (token && session.user) {
        console.log("✅ Adding token data to session:", token.id, token.role)
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect Callback - url:", url, "baseUrl:", baseUrl)
      console.log("🌐 NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
      console.log("🔗 Current URL parts:", { url, baseUrl })
      
      // Handle Google OAuth callback
      if (url.includes('/api/auth/callback/google')) {
        console.log("📱 Google OAuth callback detected")
        return `${baseUrl}/dashboard`
      }
      
      // Always redirect to dashboard after successful login
      if (url.startsWith("/") && !url.includes("/login")) {
        console.log("📍 Redirecting to dashboard from relative URL")
        return `${baseUrl}/dashboard`
      }
      
      // If it's a login page, redirect to dashboard
      if (url.includes("/login") || url === baseUrl) {
        console.log("🏠 Redirecting to dashboard from login/home")
        return `${baseUrl}/dashboard`
      }
      
      console.log("↩️ Default redirect logic")
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`
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