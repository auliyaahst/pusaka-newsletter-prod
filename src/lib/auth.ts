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

          // Regular password login (fallback for existing users)
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