import { createAuthClient } from "better-auth/react";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

// Inisialisasi SDK Better Auth Client untuk Frontend
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    oauthProviderClient(),
  ],
  // Tambahan opsi untuk memastikan credential/cookie selalu disertakan dalam request lintas domain
  fetchOptions: {
    credentials: "include",
  },
});