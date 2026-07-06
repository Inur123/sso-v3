import { auth } from "./auth.js";
import { db } from "./db.js";
import { user, verification, auditLog } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("=== Meriset Database & Menjalankan Seeder Admin ===");

    // 1. Reset Database: Hapus seluruh user dan data verifikasi serta log audit
    console.log("🧹 Menghapus semua data user, session, account, dan audit log di database...");
    await db.delete(user);
    await db.delete(verification);
    await db.delete(auditLog);
    console.log("✔ Database berhasil dikosongkan.");

    // 2. Daftarkan ulang admin@gmail.com secara bersih
    console.log("👤 Mendaftarkan akun admin baru...");
    await auth.api.signUpEmail({
      body: {
        email: "admin@gmail.com",
        password: "adminpassword123", // Password reset resmi
        name: "Admin SSO Portal",
      },
    });

    console.log("✔ Admin sukses didaftarkan!");

    // 3. Verifikasi email admin secara otomatis di database agar bisa langsung login
    console.log("🔑 Memverifikasi email admin secara otomatis...");
    await db.update(user).set({ emailVerified: true }).where(eq(user.email, "admin@gmail.com"));
    console.log("✔ Email admin berhasil diverifikasi!");

    // 4. Tambah Audit Log awal (Simulasi aktivitas sistem)
    console.log("📝 Menambahkan data audit log awal...");
    const adminUser = await db.select().from(user).where(eq(user.email, "admin@gmail.com")).limit(1);
    const adminId = adminUser.length > 0 ? adminUser[0].id : null;

    await db.insert(auditLog).values([
      {
        id: globalThis.crypto.randomUUID(),
        userId: adminId,
        action: "system.init",
        clientIp: "127.0.0.1",
        userAgent: "System Initializer v3",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 jam lalu
        metadata: "Sistem SSO berhasil diinisialisasi pertama kali.",
      },
      {
        id: globalThis.crypto.randomUUID(),
        userId: adminId,
        action: "user.signup",
        clientIp: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt: new Date(Date.now() - 2.5 * 3600 * 1000), // 2.5 jam lalu
        metadata: "Pendaftaran pengguna baru dengan email: admin@gmail.com",
      },
      {
        id: globalThis.crypto.randomUUID(),
        userId: adminId,
        action: "user.login",
        clientIp: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 jam lalu
        metadata: "Pengguna berhasil melakukan login",
      },
      {
        id: globalThis.crypto.randomUUID(),
        userId: adminId,
        action: "client.created",
        clientIp: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000), // 1 jam lalu
        metadata: "Membuat client aplikasi: Portal Karyawan (Client ID: client_portal_karyawan)",
      }
    ]);
    console.log("✔ Data audit log awal berhasil ditambahkan!");

    console.log("   - Email: admin@gmail.com");
    console.log("   - Password: adminpassword123");
  } catch (err: any) {
    console.error("❌ Gagal menjalankan seeder admin:", err);
  } finally {
    process.exit(0);
  }
}

main();
