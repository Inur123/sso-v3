import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db.js";
import { oauthClient, user, auditLog, verification } from "../schema.js";
import { eq, desc, ne } from "drizzle-orm";
import * as crypto from "crypto";

// Definisi skema body untuk pembuatan Client Aplikasi
interface CreateClientBody {
  name: string;
  redirectUris: string[];
}

export async function adminRoutes(fastify: FastifyInstance) {
  // Ambil ID admin@gmail.com secara asinkron saat server start
  let adminUserId: string | null = null;
  db.select({ id: user.id })
    .from(user)
    .where(eq(user.email, "admin@gmail.com"))
    .limit(1)
    .then((res) => {
      if (res.length > 0) adminUserId = res[0].id;
    })
    .catch((err) => {
      console.error("Gagal mendapatkan adminUserId:", err);
    });

  // Middleware/Hook sederhana untuk memastikan request adalah Admin (untuk simulasi / standarisasi)
  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    // Di dunia nyata, Anda akan membaca session dari Better Auth di sini
    // Untuk mempermudah development/test, kita bisa menggunakan token header sederhana untuk simulasi
    const authHeader = request.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin-super-secret-token") {
      return reply.status(403).send({ error: "Forbidden: Hanya Admin yang diizinkan" });
    }
  });

  // 1. Mendaftarkan Aplikasi Client Baru
  fastify.post("/clients", async (request: FastifyRequest<{ Body: CreateClientBody }>, reply: FastifyReply) => {
    const { name, redirectUris } = request.body;

    if (!name || !redirectUris || redirectUris.length === 0) {
      return reply.status(400).send({ error: "Nama dan Redirect URIs wajib diisi" });
    }

    // Generate Client ID & Client Secret standar industri
    const clientId = `client_${crypto.randomBytes(16).toString("hex")}`;
    const clientSecret = `secret_${crypto.randomBytes(32).toString("hex")}`;

    const newClient = {
      id: crypto.randomUUID(),
      clientId,
      clientSecret,
      name,
      redirectUris,
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(oauthClient).values(newClient);

    // Catat ke Audit Log
    try {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: adminUserId, // Diisi ID Admin
        action: "client.created",
        clientIp: request.ip || "127.0.0.1",
        userAgent: request.headers["user-agent"] || "unknown",
        createdAt: new Date(),
        metadata: `Membuat client aplikasi: ${name} (Client ID: ${clientId})`,
      });
    } catch (logErr) {
      fastify.log.error(logErr, "Gagal menulis audit log client.created");
    }

    return reply.status(210).send({
      message: "Aplikasi Client berhasil didaftarkan",
      client: {
        id: newClient.id,
        clientId: newClient.clientId,
        clientSecret: newClient.clientSecret,
        name: newClient.name,
        redirectUris: newClient.redirectUris,
      }
    });
  });

  // 2. Mendapatkan Semua Aplikasi Client
  fastify.get("/clients", async (request: FastifyRequest, reply: FastifyReply) => {
    const clients = await db.select().from(oauthClient);
    return reply.send(clients);
  });

  // 3. Menghapus Aplikasi Client
  fastify.delete("/clients/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    
    // Cari detail client terlebih dahulu sebelum dihapus untuk pencatatan log
    const client = await db.select().from(oauthClient).where(eq(oauthClient.id, id)).limit(1);
    const clientName = client.length > 0 ? client[0].name : "unknown";
    const clientId = client.length > 0 ? client[0].clientId : "unknown";

    await db.delete(oauthClient).where(eq(oauthClient.id, id));

    // Catat ke Audit Log
    try {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: adminUserId, // Diisi ID Admin
        action: "client.deleted",
        clientIp: request.ip || "127.0.0.1",
        userAgent: request.headers["user-agent"] || "unknown",
        createdAt: new Date(),
        metadata: `Menghapus client aplikasi: ${clientName} (Client ID: ${clientId})`,
      });
    } catch (logErr) {
      fastify.log.error(logErr, "Gagal menulis audit log client.deleted");
    }

    return reply.send({ message: "Aplikasi Client berhasil dihapus" });
  });

  // 4. Mendapatkan Detail Satu Aplikasi Client
  fastify.get("/clients/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const client = await db.select().from(oauthClient).where(eq(oauthClient.id, id)).limit(1);
    if (client.length === 0) {
      return reply.status(404).send({ error: "Aplikasi tidak ditemukan" });
    }
    return reply.send(client[0]);
  });

  // 4a. Mendapatkan Semua Pengguna (Kecuali Admin)
  fastify.get("/users", async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.role, "user"))
      .orderBy(desc(user.createdAt));
    return reply.send(users);
  });

  // 4b. Mendapatkan Detail Satu Pengguna
  fastify.get("/users/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const foundUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (foundUser.length === 0) {
      return reply.status(404).send({ error: "Pengguna tidak ditemukan" });
    }
    return reply.send(foundUser[0]);
  });

  // 4c. Mengubah Status Aktif/Nonaktif Pengguna
  fastify.patch("/users/:id/status", async (request: FastifyRequest<{ Params: { id: string }; Body: { isActive: boolean } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const { isActive } = request.body;

    if (typeof isActive !== "boolean") {
      return reply.status(400).send({ error: "isActive wajib bertipe boolean" });
    }

    const foundUser = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (foundUser.length === 0) {
      return reply.status(404).send({ error: "Pengguna tidak ditemukan" });
    }

    await db.update(user).set({ isActive }).where(eq(user.id, id));

    // Catat ke Audit Log
    try {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: adminUserId, // Diisi ID Admin
        action: isActive ? "user.activated" : "user.deactivated",
        clientIp: request.ip || "127.0.0.1",
        userAgent: request.headers["user-agent"] || "unknown",
        createdAt: new Date(),
        metadata: `${isActive ? "Mengaktifkan" : "Menonaktifkan"} akun pengguna: ${foundUser[0].name} (${foundUser[0].email})`,
      });
    } catch (logErr) {
      fastify.log.error(logErr, "Gagal menulis audit log status update");
    }

    return reply.send({ message: "Status pengguna berhasil diperbarui", isActive });
  });

  // 4d. Menghapus Pengguna
  fastify.delete("/users/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const foundUser = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (foundUser.length === 0) {
      return reply.status(404).send({ error: "Pengguna tidak ditemukan" });
    }

    await db.delete(user).where(eq(user.id, id));

    // Simpan email sebagai blacklist agar tidak bisa daftar/login ulang tanpa verifikasi baru
    try {
      await db.insert(verification).values({
        id: crypto.randomUUID(),
        identifier: `deleted_email:${foundUser[0].email}`,
        value: "blacklisted",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10), // 10 tahun
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (blacklistErr) {
      fastify.log.error(blacklistErr, "Gagal menyimpan blacklist email");
    }

    // Catat ke Audit Log
    try {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId: adminUserId, // Diisi ID Admin
        action: "user.deleted",
        clientIp: request.ip || "127.0.0.1",
        userAgent: request.headers["user-agent"] || "unknown",
        createdAt: new Date(),
        metadata: `Menghapus akun pengguna: ${foundUser[0].name} (${foundUser[0].email})`,
      });
    } catch (logErr) {
      fastify.log.error(logErr, "Gagal menulis audit log user.deleted");
    }

    return reply.send({ message: "Pengguna berhasil dihapus" });
  });

  // 5. Mendapatkan Jumlah Total User terdaftar (Hanya Role User)
  fastify.get("/users/count", async (request: FastifyRequest, reply: FastifyReply) => {
    const regularUsers = await db.select().from(user).where(eq(user.role, "user"));
    return reply.send({ count: regularUsers.length });
  });

  // 6. Mendapatkan Log Audit Sistem Terkini
  fastify.get("/audit-logs", async (request: FastifyRequest, reply: FastifyReply) => {
    const logs = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        clientIp: auditLog.clientIp,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt,
        metadata: auditLog.metadata,
        userEmail: user.email,
        userName: user.name,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(100);

    return reply.send(logs);
  });

  // 7. Mendapatkan Detail Satu Log Audit
  fastify.get("/audit-logs/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const log = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        clientIp: auditLog.clientIp,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt,
        metadata: auditLog.metadata,
        userEmail: user.email,
        userName: user.name,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .where(eq(auditLog.id, id))
      .limit(1);

    if (log.length === 0) {
      return reply.status(404).send({ error: "Log audit tidak ditemukan" });
    }
    return reply.send(log[0]);
  });
}
