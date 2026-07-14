# Alur Otentikasi OAuth2

Portal SSO ini menerapkan standar alur **OAuth2 Authorization Code Grant** (dengan opsional OIDC). Alur ini sangat direkomendasikan untuk aplikasi server-side (seperti Laravel, Node.js, Next.js, Django) karena kunci rahasia (`client_secret`) tidak pernah terekspos ke publik.

---

## Diagram Alur Sederhana

```
   +--------+                               +---------------+
   |        |--(A)-- Redirect Authorization|               |
   |        |        Page dengan Client ID  |               |
   |        |                               |               |
   |        |<-(B)-- Redirect Callback -----|               |
   |        |        dengan Auth Code       |               |
   |        |                               |               |
   | Client |--(C)-- Tukar Auth Code + -----|   SSO Server  |
   | App    |        Secret dengan Token    |               |
   |        |                               |               |
   |        |<-(D)-- Kirim Access Token ----|               |
   |        |                               |               |
   |        |--(E)-- Ambil Profil dengan ---|               |
   |        |        Access Token           |               |
   |        |                               |               |
   |        |<-(F)-- Kirim Data Pengguna ---|               |
   +--------+                               +---------------+
```

---

## Detail Alur Integrasi

### 1. Mengalihkan Pengguna ke Halaman Login SSO
Aplikasi klien harus mengalihkan browser pengguna ke URL otorisasi SSO:

**Contoh URL:**
```http
GET http://localhost:5001/oauth2/authorize?
  response_type=code
  &client_id=CLIENT_ID_ANDA
  &redirect_uri=CALLBACK_URL_ANDA
  &state=RANDOM_STRING_UNIK
```

### 2. Menerima Kode Otorisasi (Auth Code)
Setelah pengguna masuk dan menyetujui akses aplikasi Anda, server SSO akan mengalihkan kembali ke `redirect_uri` Anda dengan menyertakan kode otorisasi:

**Contoh URL Callback:**
```http
GET https://aplikasikamu.com/auth/callback?
  code=auth_code_dari_server_sso
  &state=RANDOM_STRING_UNIK
```

> [!IMPORTANT]
> Verifikasi parameter `state` untuk mencegah serangan CSRF. Pastikan nilainya sama dengan nilai acak yang Anda kirimkan pada langkah pertama.

### 3. Menukarkan Kode Otorisasi dengan Token
Aplikasi backend Anda harus mengirimkan permintaan `POST` di balik layar ke token endpoint SSO untuk menukarkan kode tersebut menjadi Token Akses:

**Request HTTP:**
```http
POST http://localhost:5001/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_YANG_DITERIMA
&client_id=CLIENT_ID_ANDA
&client_secret=CLIENT_SECRET_ANDA
&redirect_uri=CALLBACK_URL_ANDA
&code_verifier=VERIFIER_PKCE_ANDA
```

**Response HTTP (JSON):**
```json
{
  "access_token": "ey...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "ref_...",
  "id_token": "ey..."
}
```

### 4. Mengambil Profil Pengguna
Gunakan `access_token` yang diperoleh untuk meminta data profil lengkap pengguna SSO:

**Request HTTP:**
```http
GET http://localhost:5001/oauth2/userinfo
Authorization: Bearer ACCESS_TOKEN_ANDA
```

**Response HTTP (JSON):**
```json
{
  "id": "user-uuid-1234",
  "name": "Muhammad Zain",
  "email": "zain@gmail.com",
  "emailVerified": true
}
```
Aplikasi Anda sekarang dapat masuk atau membuat akun lokal berdasarkan informasi profil ini!
