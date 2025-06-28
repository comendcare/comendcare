import { researcherAuthOptions } from "~provider/lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(researcherAuthOptions)

export { handler as GET, handler as POST }
