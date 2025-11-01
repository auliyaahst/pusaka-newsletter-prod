import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

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
          // TEMPORARY: Mock user to bypass database connection issue
          const mockUser = {
            id: '1',
            email: 'tpadmin@thepusaka.id',
            name: 'TP Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            isVerified: true,
            password: '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // M@cchiato0#
          }

          const user = mockUser.email.toLowerCase() === credentials.email.toLowerCase() ? mockUser : null
          console.log("👤 [TEMP] User found:", user ? "Yes" : "No")

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

          // TEMPORARY: Check against both old and new password
          const oldPasswordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3w6ckVG/Sy' // admin123
          const newPasswordHash = '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // M@cchiato0#
          
          const isValidOldPassword = await bcrypt.compare(credentials.password, oldPasswordHash)
          const isValidNewPassword = await bcrypt.compare(credentials.password, newPasswordHash)
          const isPasswordValid = isValidOldPassword || isValidNewPassword

          console.log("🔑 [TEMP] Password valid:", isPasswordValid)
          console.log("🔍 [TEMP] Testing password:", credentials.password)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            throw new Error("Invalid credentials")
          }

          if (!user.isActive) {
            console.log("❌ User not active")
            throw new Error("Account is not active")
          }

          console.log("✅ [TEMP] Authentication successful for:", user.email)
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