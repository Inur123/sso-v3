import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { oauthProvider } from "@better-auth/oauth-provider";
import { jwt, bearer } from "better-auth/plugins";
import { db } from "./db.js";
import * as schema from "./schema.js";
import { Resend } from "resend";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

// Fungsi pembangun email HTML kustom (Indigo & Slate Theme)
function buildHtmlEmail({
  title,
  name,
  description,
  buttonText,
  buttonUrl,
  expiresInText,
}: {
  title: string;
  name: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  expiresInText: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
                <!-- Header Branding -->
                <tr>
                  <td style="padding: 24px 32px; border-bottom: 1px solid #f1f5f9; background-color: #fafafa; font-size: 16px; font-weight: 700; color: #4f46e5; text-align: left;">
                    Portal SSO Perusahaan
                  </td>
                </tr>
                
                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px; text-align: left;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">
                      ${title}
                    </h2>
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                      Halo <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                      ${description}
                    </p>
                    
                    <!-- Action Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td align="center">
                          <a href="${buttonUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px 0 rgba(79, 70, 229, 0.15); transition: background-color 0.2s;">
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Divider & Alternatif Link -->
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; line-height: 1.4;">
                      Jika tombol di atas tidak berfungsi, silakan salin dan tempel URL berikut ke browser Anda:
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 11px; color: #4f46e5; line-height: 1.4; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                      <a href="${buttonUrl}" target="_blank" style="color: #4f46e5; text-decoration: none;">${buttonUrl}</a>
                    </p>
                    
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; font-style: italic;">
                      Tautan ini berlaku selama ${expiresInText}. Jika Anda tidak melakukan permintaan ini, harap abaikan email ini dengan aman.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
                    &copy; 2026 Portal SSO Perusahaan. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Konfigurasi Utama Better Auth (Enterprise Standard)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: schema, // Menyediakan skema agar model "user" terdeteksi
  }),
  errorURL: `${process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",")[0] : "http://localhost:3000"}/login`,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Google OAuth/social login selalu memberi emailVerified=true dari provider
          // Kita blokir semua pembuatan akun baru via Google → harus register manual
          if (user.emailVerified) {
            throw new APIError("UNAUTHORIZED", {
              message: "google_not_registered",
            });
          }
        },
        after: async (user) => {
          // Safety net: jika user lolos dari before hook dengan emailVerified=true
          // (terjadi pada beberapa versi Better Auth di social login), hapus langsung
          if (user.emailVerified && user.image?.includes("googleusercontent.com")) {
            try {
              await db.delete(schema.user).where(eq(schema.user.id, user.id));
            } catch (e) {
              console.error("Gagal menghapus akun Google yang tidak sah:", e);
            }
            return; // Jangan tulis audit log untuk akun yang dihapus
          }

          try {
            await db.insert(schema.auditLog).values({
              id: globalThis.crypto.randomUUID(),
              userId: user.id,
              action: "user.signup",
              clientIp: "unknown",
              userAgent: "unknown",
              createdAt: new Date(),
              metadata: `Pendaftaran pengguna baru dengan email: ${user.email}`,
            });
          } catch (e) {
            console.error("Gagal mencatat audit log user.signup:", e);
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const foundUser = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

          if (foundUser.length > 0) {
            if (!foundUser[0].isActive) {
              throw new APIError("UNAUTHORIZED", {
                message: "Akun Anda telah dinonaktifkan oleh administrator.",
              });
            }
            if (!foundUser[0].emailVerified) {
              throw new APIError("UNAUTHORIZED", {
                message: "Email belum diverifikasi. Silakan periksa kotak masuk email Anda.",
              });
            }
          }
        },
        after: async (session) => {
          try {
            await db.insert(schema.auditLog).values({
              id: globalThis.crypto.randomUUID(),
              userId: session.userId,
              action: "user.login",
              clientIp: session.ipAddress || "unknown",
              userAgent: session.userAgent || "unknown",
              createdAt: new Date(),
              metadata: "Pengguna berhasil melakukan login",
            });
          } catch (e) {
            console.error("Gagal mencatat audit log user.login:", e);
          }
        },
      },
      delete: {
        after: async (session) => {
          try {
            await db.insert(schema.auditLog).values({
              id: globalThis.crypto.randomUUID(),
              userId: session.userId,
              action: "user.logout",
              clientIp: session.ipAddress || "unknown",
              userAgent: session.userAgent || "unknown",
              createdAt: new Date(),
              metadata: "Pengguna berhasil melakukan logout",
            });
          } catch (e) {
            console.error("Gagal mencatat audit log user.logout:", e);
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true, // Login dengan email dan password aktif
    requireEmailVerification: true, // Wajib verifikasi email sebelum bisa login
    autoSignIn: false, // Matikan auto login setelah sign up agar wajib verifikasi email
    passwordResetTokenExpiresIn: 300, // Masa aktif token reset password: 5 menit (300 detik)
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      try {
        console.log(`[Resend] Mengirim reset kata sandi ke: ${user.email}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "SSO Portal <no-reply@zainur.biz.id>",
          to: user.email,
          subject: "Atur Ulang Kata Sandi - SSO Portal",
          html: buildHtmlEmail({
            title: "Atur Ulang Kata Sandi Akun",
            name: user.name,
            description: "Anda menerima email ini karena ada permintaan untuk mengatur ulang kata sandi akun SSO Anda. Silakan klik tombol di bawah ini untuk menyetel kata sandi baru Anda:",
            buttonText: "Atur Ulang Kata Sandi",
            buttonUrl: url,
            expiresInText: "5 menit",
          }),
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
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Otomatis kirim email saat register
    expiresIn: 3600, // Masa aktif token verifikasi email: 1 jam (3600 detik)
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      try {
        console.log(`[Resend] Mengirim verifikasi pendaftaran ke: ${user.email}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "SSO Portal <no-reply@zainur.biz.id>",
          to: user.email,
          subject: "Verifikasi Alamat Email Anda - SSO Portal",
          html: buildHtmlEmail({
            title: "Verifikasi Alamat Email Anda",
            name: user.name,
            description: "Terima kasih telah mendaftar di Portal SSO Perusahaan. Silakan lakukan konfirmasi alamat email Anda dengan mengeklik tombol verifikasi di bawah ini untuk mengaktifkan akun Anda:",
            buttonText: "Verifikasi Email Saya",
            buttonUrl: url,
            expiresInText: "1 jam",
          }),
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
          html: buildHtmlEmail({
            title: "Konfirmasi Perubahan Alamat Email",
            name: user.name,
            description: "Anda telah meminta untuk mengubah alamat email akun SSO Anda. Silakan klik tombol di bawah ini untuk memverifikasi dan mengaktifkan alamat email baru Anda:",
            buttonText: "Konfirmasi Email Baru",
            buttonUrl: url,
            expiresInText: "1 jam",
          }),
        });
        console.log("[Resend] Sukses mengirim email verifikasi ganti email:", result);
      } catch (err) {
        console.error("[Resend] Gagal mengirim email verifikasi ganti email:", err);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : [],
  advanced: {
    useSecureCookies: false, // Setel false agar browser HTTP localhost bisa menyimpan cookie dari HTTPS backend
    cookie: {
      sameSite: "none",
    },
  },
  plugins: [
    jwt(), // Wajib ada untuk Oauth Provider
    oauthProvider({
      loginPage: "/login", // Halaman login terpisah di frontend
      consentPage: "/consent", // Halaman persetujuan akses
    }),
    bearer(), // Mengaktifkan verifikasi header "Authorization: Bearer <token>" secara native
  ],
});
