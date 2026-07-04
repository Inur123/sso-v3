import { auth } from "./auth.js";
import { db } from "./db.js";
import { user, verification } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("=== Meriset Database & Menjalankan Seeder Admin ===");

    // 1. Reset Database: Hapus seluruh user dan data verifikasi
    console.log("🧹 Menghapus semua data user, session, dan account di database...");
    await db.delete(user);
    await db.delete(verification);
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
    console.log("   - Email: admin@gmail.com");
    console.log("   - Password: adminpassword123");
  } catch (err: any) {
    console.error("❌ Gagal menjalankan seeder admin:", err);
  } finally {
    process.exit(0);
  }
}

main();
