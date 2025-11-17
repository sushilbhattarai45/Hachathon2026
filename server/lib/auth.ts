// src/lib/auth.ts
import "dotenv/config";
import crypto from "crypto";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const microsoftId = process.env.MICROSOFT_CLIENT_ID!;
console.log(microsoftId);
const microsoftTenant = process.env.BETTER_AUTH_MICROSOFT_TENANT;

const prisma = new PrismaClient();

console.log("SCHEME", process.env.EXPO_SCHEME);

const config: BetterAuthOptions = {
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  plugins: [expo()],
  // Ensure your mobile scheme is trusted so deep link callbacks work
  trustedOrigins: [
    process.env.EXPO_SCHEME
      ? `${process.env.EXPO_SCHEME}://`
      : "mailactionsapp://",
    "exp://",
  ],

  socialProviders: {
    microsoft: {
      clientId: microsoftId,
      tenantId: microsoftTenant ?? "common",
      authority: "https://login.microsoftonline.com", // Authentication authority URL
      prompt: "select_account", // Forces account selection
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
};

export const auth = betterAuth(config);
export type Auth = typeof auth;
