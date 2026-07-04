# Rencana Implementasi Sistem SSO (Single Sign-On) - Dokumentasi Lengkap

Dokumen ini berisi panduan dan referensi lengkap langkah demi langkah untuk membangun seluruh ekosistem SSO (Backend API & Frontend UI) di dalam folder `/Users/muhammadzainurroziqin/Documents/coding/sso-v3`.

---

## 🟢 BAGIAN 1: BACKEND API (Sudah Selesai Dikerjakan)

Bagian ini telah berhasil diimplementasikan di `/Users/muhammadzainurroziqin/Documents/coding/sso-v3/backend` menggunakan Fastify + Better Auth + PostgreSQL.

### Langkah 1: Persiapan Database PostgreSQL
Membuat database baru di PostgreSQL lokal bernama `sso_v3_db`.
- **Perintah:**
  ```bash
  PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE sso_v3_db;"
  ```

### Langkah 2: Setup Inisialisasi Proyek Backend (`sso-v3/backend`)
Membuat folder `backend` dan menginisialisasi proyek baru menggunakan Bun.
- **Perintah:**
  ```bash
  mkdir -p backend
  cd backend
  bun init -y
  ```

### Langkah 3: Instalasi Dependensi Backend
Menginstal library web server, database ORM, dan modul keamanan enterprise:
- **Perintah:**
  ```bash
  bun add fastify @fastify/cors @fastify/helmet @fastify/rate-limit better-auth @better-auth/drizzle-adapter @better-auth/oauth-provider pg drizzle-orm dotenv
  bun add -d typescript @types/node @types/pg drizzle-kit tsx
  ```

### Langkah 4: Pembuatan File Konfigurasi Backend
1. **`.env`**: Menyimpan `DATABASE_URL` (port 5432) dan rahasia enkripsi Better Auth.
2. **`tsconfig.json`**: Konfigurasi TypeScript compiler (menggunakan `NodeNext` ESM module resolution).
3. **`drizzle.config.ts`**: Menghubungkan Drizzle Kit dengan database PostgreSQL.

### Langkah 5: Penulisan Kode Program Backend
1. **`src/db.ts`**: Penghubung database Postgres dengan Drizzle ORM menggunakan *Connection Pooling* standar produksi.
2. **`src/auth.ts`**: Konfigurasi Better Auth terintegrasi dengan adapter Drizzle dan plugin `@better-auth/oauth-provider` (OAuth 2.1 / OIDC Server).
3. **`src/routes/admin.ts`**: Rute API khusus admin (`/api/admin/clients`) untuk membuat, melihat, dan menghapus aplikasi client SSO.
4. **`src/server.ts`**: Web server Fastify di port `5001` dengan proteksi Helmet, CORS, Rate Limiter, JSON logging, rute admin, rute Better Auth, dan Graceful Shutdown.

### Langkah 6: Eksekusi Migrasi Database (Push Schema)
Mengirimkan skema tabel Better Auth yang dibuat otomatis ke database PostgreSQL lokal.
- **Perintah:**
  ```bash
  bunx @better-auth/cli generate --output ./src/schema.ts --yes
  bun x drizzle-kit push
  ```

### Langkah 7: Uji Coba Server Backend
Menjalankan server Fastify secara lokal di port `5001`.
- **Perintah:**
  ```bash
  bun run src/server.ts
  ```

---

## 🔵 BAGIAN 2: FRONTEND UI (Rencana Langkah Selanjutnya)

Bagian ini akan dikembangkan di `/Users/muhammadzainurroziqin/Documents/coding/sso-v3/frontend` menggunakan Next.js (App Router) + TailwindCSS + Shadcn UI Original (Strictly Light Mode).

### Langkah 8: Setup Inisialisasi Proyek Frontend (`sso-v3/frontend`)
Kita akan membuat proyek Next.js baru di dalam folder `frontend` menggunakan Bun.
- **Perintah:**
  ```bash
  cd /Users/muhammadzainurroziqin/Documents/coding/sso-v3
  bun create next-app frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun
  ```

### Langkah 9: Setup Shadcn UI (Original & Light Mode)
Menginisialisasi Shadcn UI bawaan asli menggunakan CLI resmi dengan pengaturan default (Light Mode saja).
- **Perintah (di dalam folder frontend):**
  ```bash
  cd frontend
  bunx shadcn@latest init -d
  ```
- **Catatan:** File `globals.css` yang dihasilkan murni dari Shadcn UI. Kita hanya akan mendesain UI dengan skema warna Light Mode bawaan (latar belakang putih, card abu-abu terang/putih, text hitam/gelap).

### Langkah 10: Instalasi Dependensi Frontend
Menginstal library client SDK Better Auth dan pendukungnya:
- **Perintah:**
  ```bash
  bun add better-auth lucide-react clsx tailwind-merge
  ```

### Langkah 11: Konfigurasi File Lingkungan Frontend (`frontend/.env.local`)
Menghubungkan Frontend ke port Backend Fastify yang berjalan di port `5001`.
```env
NEXT_PUBLIC_API_URL="http://localhost:5001"
```

### Langkah 12: Inisialisasi Better Auth Client SDK (`src/lib/auth-client.ts`)
Membuat instansi Client SDK untuk memanggil fungsi-fungsi autentikasi Better Auth di React:
```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});
```

### Langkah 13: Penulisan Halaman UI (Tampilan Premium - Strictly Light Mode)
Kita akan membuat halaman-halaman utama:
1. **Halaman Login (`/login`):** Form login minimalis berwarna putih terang bersih menggunakan komponen Input, Button, dan Card dari Shadcn UI.
2. **Halaman Register (`/register`):** Form daftar akun baru dengan gaya terang yang selaras.
3. **Halaman Persetujuan OIDC (`/consent`):** Tampilan konfirmasi otorisasi aplikasi luar (light mode).
4. **Halaman Dashboard Admin (`/admin/dashboard`):** Tabel daftar aplikasi client terdaftar (memanggil API `/api/admin/clients`) dan dialog popup untuk mendaftarkan aplikasi client baru secara instan.
