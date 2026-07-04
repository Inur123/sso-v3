import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// Membuat connection pool ke PostgreSQL (Standar Enterprise)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Batas maksimal koneksi simultan
  idleTimeoutMillis: 30000, // Menutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 2000, // Timeout koneksi 2 detik
});

export const db = drizzle(pool);
