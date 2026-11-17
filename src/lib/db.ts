import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

// TURSO_DATABASE_URL is a libsql://... URL for the hosted Turso database, or
// file:local.db to use a local SQLite file during development.
export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  return client;
}
