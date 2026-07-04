import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, bearer } from "better-auth/plugins";
import { db } from "./db.js";
import * as schema from "./schema.js";

// Konfigurasi Utama Better Auth (Enterprise Standard)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: schema, // Menyediakan skema agar model "user" terdeteksi
  }),
  emailAndPassword: {
    enabled: true, // Login dengan email dan password aktif
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : [],
  plugins: [
    jwt(), // Wajib ada untuk Oauth Provider
    oauthProvider({
      loginPage: "/login", // Halaman login terpisah di frontend
      consentPage: "/consent", // Halaman persetujuan akses
    }),
    bearer(), // Mengaktifkan verifikasi header "Authorization: Bearer <token>" secara native
  ],
});
