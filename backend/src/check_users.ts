import { db } from "./db.js";
import { user } from "./schema.js";

async function main() {
  const users = await db.select().from(user);
  console.log("=== DAFTAR PENGGUNA DI DATABASE ===");
  console.dir(users, { depth: null });
  process.exit(0);
}

main().catch(console.error);
