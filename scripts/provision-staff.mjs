import "dotenv/config";
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3];
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["ADMIN", "EDITOR"].includes(role)) {
  throw new Error("Usage: npm run staff:provision -- EMAIL ADMIN|EDITOR");
}
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
await client.connect();
try {
  await client.query('INSERT INTO "Staff" (id,email,role,active) VALUES ($1,$2,$3,true) ON CONFLICT (email) DO UPDATE SET role=EXCLUDED.role,active=true', [crypto.randomUUID(), email, role]);
  console.log("Staff access provisioned. Google sign-in still requires a verified email.");
} finally { await client.end(); }
