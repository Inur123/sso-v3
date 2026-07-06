import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, bearer } from "better-auth/plugins";
import { db } from "./db.js";
import * as schema from "./schema.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Konfigurasi Utama Better Auth (Enterprise Standard)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: schema, // Menyediakan skema agar model "user" terdeteksi
  }),
  emailAndPassword: {
    enabled: true, // Login dengan email dan password aktif
    requireEmailVerification: true, // Wajib verifikasi email sebelum bisa login
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      try {
        console.log(`[Resend] Mengirim reset kata sandi ke: ${user.email}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "SSO Portal <no-reply@zainur.biz.id>",
          to: user.email,
          subject: "Atur Ulang Kata Sandi - SSO Portal",
          html: `<p>Halo ${user.name},</p>
                 <p>Anda meminta untuk mengatur ulang kata sandi Anda. Silakan klik tautan di bawah ini untuk mereset kata sandi Anda:</p>
                 <p><a href="${url}">${url}</a></p>`,
        });
        console.log("[Resend] Sukses mengirim email reset kata sandi:", result);
      } catch (err) {
        console.error("[Resend] Gagal mengirim email reset kata sandi:", err);
      }
    },
  },
  user: {
    changeEmail: {
      enabled: true, // Aktifkan fitur ganti email Better Auth
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Otomatis kirim email saat register
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      try {
        console.log(`[Resend] Mengirim verifikasi pendaftaran ke: ${user.email}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "SSO Portal <no-reply@zainur.biz.id>",
          to: user.email,
          subject: "Verifikasi Alamat Email Anda - SSO Portal",
          html: `<p>Halo ${user.name},</p>
                 <p>Terima kasih telah mendaftar. Silakan klik tautan di bawah ini untuk memverifikasi akun Anda:</p>
                 <p><a href="${url}">${url}</a></p>`,
        });
        console.log("[Resend] Sukses mengirim email verifikasi pendaftaran:", result);
      } catch (err) {
        console.error("[Resend] Gagal mengirim email verifikasi pendaftaran:", err);
      }
    },
    sendChangeEmailVerification: async ({ user, newEmail, url }: { user: any; newEmail: string; url: string }) => {
      try {
        console.log(`[Resend] Mengirim verifikasi ganti email dari ${user.email} ke: ${newEmail}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "SSO Portal <no-reply@zainur.biz.id>",
          to: newEmail,
          subject: "Konfirmasi Perubahan Email Anda - SSO Portal",
          html: `<p>Halo ${user.name},</p>
                 <p>Anda meminta perubahan alamat email akun SSO Anda. Silakan klik tautan di bawah ini untuk mengonfirmasi email baru Anda:</p>
                 <p><a href="${url}">${url}</a></p>`,
        });
        console.log("[Resend] Sukses mengirim email verifikasi ganti email:", result);
      } catch (err) {
        console.error("[Resend] Gagal mengirim email verifikasi ganti email:", err);
      }
    },
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
  events: {
    user: {
      created: async (data: { user: { id: any; email: any; }; }) => {
        try {
          // Bun secara native menyediakan crypto.randomUUID() secara global
          await db.insert(schema.auditLog).values({
            id: globalThis.crypto.randomUUID(),
            userId: data.user.id,
            action: "user.signup",
            clientIp: "unknown",
            userAgent: "unknown",
            createdAt: new Date(),
            metadata: `Pendaftaran pengguna baru dengan email: ${data.user.email}`,
          });
        } catch (e) {
          console.error("Gagal mencatat audit log user.signup:", e);
        }
      },
    },
    session: {
      created: async (data: { session: { userId: any; ipAddress: any; userAgent: any; }; }) => {
        try {
          await db.insert(schema.auditLog).values({
            id: globalThis.crypto.randomUUID(),
            userId: data.session.userId,
            action: "user.login",
            clientIp: data.session.ipAddress || "unknown",
            userAgent: data.session.userAgent || "unknown",
            createdAt: new Date(),
            metadata: "Pengguna berhasil melakukan login",
          });
        } catch (e) {
          console.error("Gagal mencatat audit log user.login:", e);
        }
      },
      deleted: async (data: { session: { userId: any; ipAddress: any; userAgent: any; }; }) => {
        try {
          await db.insert(schema.auditLog).values({
            id: globalThis.crypto.randomUUID(),
            userId: data.session.userId,
            action: "user.logout",
            clientIp: data.session.ipAddress || "unknown",
            userAgent: data.session.userAgent || "unknown",
            createdAt: new Date(),
            metadata: "Pengguna berhasil melakukan logout",
          });
        } catch (e) {
          console.error("Gagal mencatat audit log user.logout:", e);
        }
      },
    },
  },
});
