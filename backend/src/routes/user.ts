import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { pool } from "../db.js";

export async function userRoutes(fastify: FastifyInstance) {
  // Hook untuk memastikan user sudah login dan melampirkan data session
  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const headers = fromNodeHeaders(request.headers);
    
    // Membaca session secara native (mendukung cookie & Authorization Bearer token berkat plugin bearer)
    const session = await auth.api.getSession({ headers });
    
    if (!session) {
      return reply.status(401).send({ error: "Unauthorized: Silakan login terlebih dahulu" });
    }
    
    // Simpan session di dalam request state
    (request as any).session = session;
  });

  // 1. Memuat daftar log masuk aplikasi SSO riil dari DB (Unik per Aplikasi & Mengambil Token + Waktu Terbaru)
  fastify.get("/sso-logs", async (request: FastifyRequest, reply: FastifyReply) => {
    const session = (request as any).session;
    try {
      // Mengambil data akses token terbaru untuk setiap aplikasi klien (DISTINCT ON client_id)
      // Menjamin jika login berkali-kali di aplikasi yang sama, hanya baris terbaru yang dimuat.
      const result = await pool.query(
        `SELECT DISTINCT ON (oat.client_id) 
           oat.id, 
           oat.token, 
           oat.created_at as "createdAt", 
           oc.name as "clientName"
         FROM oauth_access_token oat
         JOIN oauth_client oc ON oat.client_id = oc.client_id
         WHERE oat.user_id = $1
         ORDER BY oat.client_id, oat.created_at DESC`,
        [session.user.id]
      );
      
      return result.rows;
    } catch (err) {
      fastify.log.error(err, "Gagal mengambil data log SSO.");
      return reply.status(500).send({ error: "Gagal memuat riwayat SSO" });
    }
  });

  // 2. Mencabut Akses Aplikasi SSO (Menghapus Token Otorisasi Aplikasi)
  fastify.delete("/sso-logs/:id", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      await pool.query("DELETE FROM oauth_access_token WHERE id = $1", [id]);
      return { success: true, message: "Akses aplikasi berhasil dicabut." };
    } catch (err) {
      fastify.log.error(err, "Gagal mencabut akses aplikasi.");
      return reply.status(500).send({ error: "Gagal mencabut sesi aplikasi" });
    }
  });

  // 3. Memperbarui Profil (Nama & Email) secara instan di database
  fastify.put("/profile", async (request: FastifyRequest<{ Body: { name: string; email: string } }>, reply: FastifyReply) => {
    const session = (request as any).session;
    const { name, email } = request.body;

    if (!name || !email) {
      return reply.status(400).send({ error: "Nama dan Email wajib diisi" });
    }

    try {
      await pool.query(
        'UPDATE "user" SET name = $1, email = $2, "updated_at" = NOW() WHERE id = $3',
        [name, email, session.user.id]
      );
      return { success: true, message: "Profil berhasil diperbarui" };
    } catch (err: any) {
      if (err.code === "23505") { // Kode error duplicate key PostgreSQL
        return reply.status(400).send({ error: "Alamat email sudah digunakan oleh akun lain" });
      }
      fastify.log.error(err, "Gagal memperbarui profil.");
      return reply.status(500).send({ error: "Gagal memperbarui profil" });
    }
  });
}
