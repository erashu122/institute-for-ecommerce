import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { databaseUrl } from "../env/database";

let client: PrismaClient | undefined;

export function getPrisma() {
  if (!client) {
    const connectionString = databaseUrl.parse(process.env.DATABASE_URL);
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }),
    });
  }
  return client;
}
