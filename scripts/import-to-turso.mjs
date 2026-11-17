// One-time copy of the stories in local.db into the hosted Turso database.
//
//   node --env-file=.env.local scripts/import-to-turso.mjs
//
// Reads TURSO_DATABASE_URL (must be a libsql:// URL) and TURSO_AUTH_TOKEN.
// Safe to re-run: stories that already exist (same id) are skipped.
import { createClient } from "@libsql/client";

const targetUrl = process.env.TURSO_DATABASE_URL ?? "";
const authToken = process.env.TURSO_AUTH_TOKEN ?? "";

if (!targetUrl.startsWith("libsql://")) {
  console.error(
    `TURSO_DATABASE_URL must be your Turso URL (libsql://...), got "${targetUrl || "(empty)"}".`
  );
  process.exit(1);
}
if (!authToken) {
  console.error("TURSO_AUTH_TOKEN is empty. Create a token in the Turso dashboard first.");
  process.exit(1);
}

const source = createClient({ url: "file:local.db" });
const target = createClient({ url: targetUrl, authToken });

const { rows } = await source.execute(
  `SELECT id, name, message, "from", track, emotion FROM submissions ORDER BY id`
);
console.log(`Found ${rows.length} stories in local.db`);

await target.execute(`
  CREATE TABLE IF NOT EXISTS submissions (
    "id"      INTEGER,
    "name"    TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "from"    TEXT,
    "track"   TEXT,
    "emotion" INTEGER,
    PRIMARY KEY("id" AUTOINCREMENT)
  )
`);

const before = Number((await target.execute(`SELECT COUNT(*) AS n FROM submissions`)).rows[0].n);

await target.batch(
  rows.map((r) => ({
    sql: `INSERT OR IGNORE INTO submissions (id, name, message, "from", track, emotion)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [r.id, r.name, r.message, r.from, r.track, r.emotion],
  })),
  "write"
);

const after = Number((await target.execute(`SELECT COUNT(*) AS n FROM submissions`)).rows[0].n);
console.log(`Turso now has ${after} stories (${after - before} added, ${rows.length - (after - before)} already there).`);

source.close();
target.close();
