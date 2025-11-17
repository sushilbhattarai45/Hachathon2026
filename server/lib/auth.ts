// src/lib/auth.ts
import "dotenv/config";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { expo as betterAuthExpo, expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

const config: BetterAuthOptions = {
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: "sqlite" }),

  // Ensure your mobile scheme is trusted so deep link callbacks work
  trustedOrigins: [process.env.EXPO_SCHEME ? `${process.env.EXPO_SCHEME}://` : "myapp://"],

  plugins: [expo()],

  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT ?? "common",
    },
  },

};

export const auth = betterAuth(config);
export type Auth = typeof auth;

