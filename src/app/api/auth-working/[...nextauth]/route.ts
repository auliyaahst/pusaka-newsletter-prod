import NextAuth from "next-auth"
import { authOptionsWorking } from "@/lib/auth-working"

const handler = NextAuth(authOptionsWorking)

export { handler as GET, handler as POST }
