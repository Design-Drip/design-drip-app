import { z } from "zod";
import { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";

import User from "@/models/user";
import client from "@/lib/db";
import { Password } from "@/lib/password";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

declare module "next-auth/jwt" {
  interface JWT {
    id: string | undefined;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string | undefined;
  }
}

export default {
  adapter: MongoDBAdapter(client),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        pasword: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await User.findOne({
          email,
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await Password.comparePassword(
          password,
          user.password
        );

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
    // Google,
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token.id && session.user && "id" in session.user) {
        session.user.id = token.id;
      }

      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
