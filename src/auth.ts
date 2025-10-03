import NextAuth from "next-auth";
import Sendgrid from "next-auth/providers/sendgrid";
import { PrismaAdapter } from "@auth/prisma-adapter";

import Credentials from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Sendgrid({
      // If your environment variable is named differently than default
      from: "info@fairpayforall.co.uk",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email?.endsWith("@maddisonclarke.co.uk")) {
        return true;
      }

      return false;
    },
  },
});
