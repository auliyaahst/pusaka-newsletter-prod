import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Mock user for testing (same as in the working OTP endpoint)
const mockUser = {
  id: '1',
  email: 'tpadmin@thepusaka.id',
  name: 'TP Super Admin',
  role: 'SUPER_ADMIN',
  isActive: true,
  isVerified: true,
  // This matches the new password from the reset
  password: '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // M@cchiato0#
}

// Configure NextAuth (working version without database)
export const authOptionsWorking: NextAuthOptions = {
  // Remove PrismaAdapter to avoid database dependency
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
        console.log("🔐 [WORKING] Authorize called with email:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          throw new Error("Invalid credentials")
        }

        try {
          // Use mock user instead of database
          const user = mockUser.email.toLowerCase() === credentials.email.toLowerCase() ? mockUser : null
          console.log("👤 [WORKING] User found:", user ? "Yes" : "No")

          if (!user) {
            console.log("❌ User not found")
            throw new Error("Invalid credentials")
          }

          // Check if this is an OTP-verified login
          if (credentials.password === 'verified') {
            console.log("🔑 [WORKING] OTP-verified login")
            
            console.log("✅ [WORKING] OTP authentication successful for:", user.email)
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

          // Check against both old and new password for testing
          const oldPasswordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3w6ckVG/Sy' // admin123
          const newPasswordHash = '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // M@cchiato0#
          
          const isValidOldPassword = await bcrypt.compare(credentials.password, oldPasswordHash)
          const isValidNewPassword = await bcrypt.compare(credentials.password, newPasswordHash)
          const isPasswordValid = isValidOldPassword || isValidNewPassword
          
          console.log("🔑 [WORKING] Password valid:", isPasswordValid)
          console.log("🔍 [WORKING] Testing password:", credentials.password)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            throw new Error("Invalid credentials")
          }

          if (!user.isActive) {
            console.log("❌ User not active")
            throw new Error("Account is not active")
          }

          console.log("✅ [WORKING] Authentication successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("💥 [WORKING] Auth error:", error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub
        (session.user as any).role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 [WORKING] Redirect Callback - url:', url, 'baseUrl:', baseUrl)
      console.log('🌐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
      console.log('🔗 Current URL parts:', { url, baseUrl })
      
      // Always redirect to dashboard after successful login
      if (url.includes('/login') || url === baseUrl || url === '/') {
        console.log('🏠 [WORKING] Redirecting to dashboard from login/home')
        return `${baseUrl}/dashboard`
      }
      
      // For other URLs, use default redirect logic
      console.log('↩️ [WORKING] Default redirect logic')
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}
