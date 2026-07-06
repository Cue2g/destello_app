import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

declare module "@auth/core/types" {
  interface User {
    role: string
    clientId: number | null
  }
  interface Session {
    user: {
      id: string
      role: string
      clientId: number | null
      email: string | null
      name: string | null
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: string
    id: string
    clientId: number | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const isValid = await compare(credentials.password as string, user.passwordHash)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.id = user.id!
        token.clientId = user.clientId
      }
      return token
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          clientId: token.clientId,
        },
      }
    },
  },
})
