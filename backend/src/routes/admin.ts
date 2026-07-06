import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db.js";
import { oauthClient, user, auditLog } from "../schema.js";
import { eq, desc } from "drizzle-orm";
import * as crypto from "crypto";

// Definisi skema body untuk pembuatan Client Aplikasi
interface CreateClientBody {
  name: string;
  redirectUris: string[];
}

export async function adminRoutes(fastify: FastifyInstance) {
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
        userId: null, // Null karena Admin Console menggunakan static token saat ini
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
        userId: null,
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

  // 5. Mendapatkan Jumlah Total User terdaftar
  fastify.get("/users/count", async (request: FastifyRequest, reply: FastifyReply) => {
    const allUsers = await db.select().from(user);
    return reply.send({ count: allUsers.length });
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
