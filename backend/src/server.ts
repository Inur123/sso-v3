import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import { adminRoutes } from "./routes/admin.js";
import { pool } from "./db.js";

// Inisialisasi Server Fastify dengan JSON logging bawaan (Enterprise Audit Standard)
const fastify = Fastify({
  logger: {
    level: "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
});

// Registrasi Security HTTP Headers (Helmet)
fastify.register(helmet, {
  contentSecurityPolicy: false, // Nonaktifkan CSP jika ingin mempermudah akses OIDC Metadata di browser
});

// Registrasi CORS
fastify.register(cors, {
  origin: true, // Dinamis atau bisa diatur spesifik domain frontend nantinya
  credentials: true, // Mengizinkan pengiriman cookie session
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// Registrasi Rate Limiter (Proteksi DDoS / Brute Force)
fastify.register(rateLimit, {
  max: 100, // Maksimal 100 request
  timeWindow: "1 minute", // Per 1 menit
  errorResponseBuilder: () => ({
    error: "Too Many Requests",
    message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  }),
});

// 1. Endpoint Health Check (Standar Enterprise)
fastify.get("/health", async (request, reply) => {
  try {
    // Memastikan koneksi database PostgreSQL aktif
    await pool.query("SELECT 1");
    return { status: "OK", database: "connected", timestamp: new Date().toISOString() };
  } catch (err) {
    fastify.log.error(err, "Health check failed");
    return reply.status(503).send({ status: "ERROR", database: "disconnected" });
  }
});

// 2. Rute Penampung Utama untuk Better Auth
fastify.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const headers = fromNodeHeaders(request.headers);
    
    const webReq = new Request(url.toString(), {
      method: request.method,
      headers,
      body: request.body && request.method !== "GET" ? JSON.stringify(request.body) : undefined,
    });

    const response = await auth.handler(webReq);

    // Deteksi jika OAuth callback menghasilkan error akun dinonaktifkan, lalu redirect ke frontend
    if (request.url.includes("/api/auth/callback/")) {
      const responseStatus = response.status;
      if (responseStatus >= 400) {
        try {
          const clonedResponse = response.clone();
          const bodyText = await clonedResponse.text();
          if (bodyText.includes("Akun Anda telah dinonaktifkan oleh administrator")) {
            const frontendUrl = process.env.TRUSTED_ORIGINS
              ? process.env.TRUSTED_ORIGINS.split(",")[0]
              : "http://localhost:3000";
            const encodedMessage = encodeURIComponent("Akun Anda telah dinonaktifkan oleh administrator.");
            return reply.redirect(`${frontendUrl}/login?error=${encodedMessage}`);
          }
        } catch (e) {
          fastify.log.error(e, "Error cloning auth response");
        }
      }
    }

    reply.status(response.status);
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    return reply.send(response.body ? await response.text() : null);
  },
});

// 2. Registrasi Rute Admin & User Portal
import { userRoutes } from "./routes/user.js";
fastify.register(adminRoutes, { prefix: "/api/admin" });
fastify.register(userRoutes, { prefix: "/api/user" });

// 3. Graceful Shutdown (Mematikan server dengan rapi)
const gracefulShutdown = async () => {
  fastify.log.info("Menerima sinyal mati. Menutup server...");
  try {
    await fastify.close();
    await pool.end(); // Tutup PostgreSQL connection pool
    fastify.log.info("Koneksi database ditutup. Server mati dengan aman.");
    process.exit(0);
  } catch (err) {
    fastify.log.error(err, "Error saat mematikan server");
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Menjalankan Server di Port 5001
const start = async () => {
  try {
    const address = await fastify.listen({ port: 5001, host: "0.0.0.0" });
    fastify.log.info(`SSO Backend berjalan di ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
