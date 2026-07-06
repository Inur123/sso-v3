# Endpoints SSO

Berikut adalah referensi lengkap URL endpoints yang disediakan oleh Server Backend SSO untuk melakukan integrasi otentikasi.

---

## 1. Authorization Endpoint
Endpoint ini menampilkan halaman login SSO untuk meminta otorisasi dari pengguna.

*   **URL:** `GET /oauth2/authorize`
*   **Query Parameters:**
    | Parameter | Tipe | Wajib | Keterangan |
    | :--- | :--- | :---: | :--- |
    | `response_type` | `string` | **Ya** | Harus diisi dengan `code`. |
    | `client_id` | `string` | **Ya** | Client ID aplikasi Anda yang terdaftar. |
    | `redirect_uri` | `string` | **Ya** | URL Callback yang terdaftar. |
    | `state` | `string` | **Ya** | String acak unik untuk keamanan CSRF. |
    | `scope` | `string` | Tidak | Ruang lingkup data (misal: `openid profile email`). |

---

## 2. Token Endpoint
Endpoint ini diakses secara internal oleh server aplikasi klien (backend) untuk menukar kode otorisasi menjadi token akses.

*   **URL:** `POST /oauth2/token`
*   **Content-Type:** `application/x-www-form-urlencoded`
*   **Body Parameters:**
    | Parameter | Tipe | Wajib | Keterangan |
    | :--- | :--- | :---: | :--- |
    | `grant_type` | `string` | **Ya** | Harus diisi dengan `authorization_code`. |
    | `code` | `string` | **Ya** | Kode otorisasi yang didapatkan dari callback. |
    | `client_id` | `string` | **Ya** | Client ID aplikasi Anda. |
    | `client_secret` | `string` | **Ya** | Client Secret aplikasi Anda. |
    | `redirect_uri` | `string` | **Ya** | URL Callback yang terdaftar. |

*   **Response Sukses (200 OK):**
    ```json
    {
      "access_token": "ey...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "refresh_token": "ref_...",
      "id_token": "ey..."
    }
    ```

---

## 3. User Info Endpoint
Endpoint ini diakses secara internal untuk mengambil profil data pengguna yang sedang login berdasarkan token akses yang dilampirkan pada header otorisasi.

*   **URL:** `GET /oauth2/userinfo`
*   **Headers:**
    - `Authorization: Bearer ACCESS_TOKEN_ANDA`

*   **Response Sukses (200 OK):**
    ```json
    {
      "id": "user-uuid-1234",
      "name": "Muhammad Zain",
      "email": "zain@gmail.com",
      "emailVerified": true
    }
    ```
