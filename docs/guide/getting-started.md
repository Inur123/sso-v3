# Memulai Integrasi SSO

Panduan ini akan membantu Anda mengintegrasikan aplikasi pihak ketiga (klien) Anda dengan Portal Single Sign-On (SSO).

---

## Langkah 1: Daftarkan Aplikasi Anda

Sebelum dapat menggunakan layanan otentikasi SSO, Anda harus mendaftarkan aplikasi Anda di **Console Admin** untuk mendapatkan kredensial otentikasi.

1. Buka **Portal SSO** dan masuk sebagai **Admin**.
2. Masuk ke menu **Aplikasi Terdaftar** pada bilah samping.
3. Klik tombol **Tambah Aplikasi** di sudut kanan atas.
4. Isi formulir pendaftaran:
   - **Nama Aplikasi:** Nama yang akan ditampilkan kepada pengguna saat meminta persetujuan login.
   - **Redirect URI (Callback URL):** URL di aplikasi Anda yang akan menerima kode otorisasi setelah pengguna berhasil login (misalnya: `https://aplikasikamu.com/auth/callback`).
5. Klik **Simpan**.

---

## Langkah 2: Dapatkan Kredensial Klien

Setelah berhasil disimpan, klik nama aplikasi Anda untuk masuk ke halaman detail. Salin kredensial berikut dan simpan dengan aman:

*   **Client ID:** Identitas publik unik untuk aplikasi Anda.
*   **Client Secret:** Kunci rahasia aplikasi Anda yang digunakan untuk menukar kode otorisasi menjadi token. **Jangan pernah membagikan kunci ini atau meletakkannya di kode sisi klien (frontend).**

---

## Langkah 3: Konfigurasi Lingkungan Aplikasi Anda

Masukkan kredensial tersebut ke dalam konfigurasi environment (`.env`) aplikasi Anda:

```env
SSO_CLIENT_ID="id_aplikasi_kamu"
SSO_CLIENT_SECRET="secret_aplikasi_kamu"
SSO_REDIRECT_URI="https://aplikasikamu.com/auth/callback"
SSO_BASE_URL="http://localhost:5001" # Host backend SSO Anda
```

Sekarang aplikasi Anda siap untuk mengimplementasikan alur login OAuth2!
