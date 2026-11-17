import type { Row } from "@libsql/client";
import { getDb } from "@/lib/db";

export interface SubmissionSummary {
  id: number;
  name: string;
  message: string;
  track: string | null;
}

export interface SubmissionDetails extends SubmissionSummary {
  from: string | null;
}

export interface NewSubmission {
  name: string;
  message: string;
  from: string | null;
  track: string | null;
}

const SUMMARY_COLUMNS = `id, name, message, track`;

function toSummary(row: Row): SubmissionSummary {
  return {
    id: Number(row.id),
    name: String(row.name ?? ""),
    message: String(row.message ?? ""),
    track: row.track ? String(row.track) : null,
  };
}

export async function listSubmissions(page: number, pageSize: number) {
  const db = getDb();
  const [count, rows] = await Promise.all([
    db.execute(`SELECT COUNT(*) AS total FROM submissions`),
    db.execute({
      sql: `SELECT ${SUMMARY_COLUMNS} FROM submissions ORDER BY id DESC LIMIT ? OFFSET ?`,
      args: [pageSize, (page - 1) * pageSize],
    }),
  ]);
  const total = Number(count.rows[0]?.total ?? 0);

  return {
    items: rows.rows.map(toSummary),
    total,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function randomSubmissions(limit: number) {
  const result = await getDb().execute({
    sql: `SELECT ${SUMMARY_COLUMNS} FROM submissions ORDER BY RANDOM() LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(toSummary);
}

// Case-insensitive match on the recipient's name, longest messages first
// (the same ordering the old Python search used).
export async function searchSubmissions(query: string) {
  const escaped = query.replace(/[\\%_]/g, (c) => `\\${c}`);
  const result = await getDb().execute({
    sql: `SELECT ${SUMMARY_COLUMNS} FROM submissions
          WHERE name LIKE ? ESCAPE '\\'
          ORDER BY LENGTH(message) DESC
          LIMIT 500`,
    args: [`%${escaped}%`],
  });
  return result.rows.map(toSummary);
}

export async function getSubmission(id: number): Promise<SubmissionDetails | null> {
  const result = await getDb().execute({
    sql: `SELECT ${SUMMARY_COLUMNS}, "from" FROM submissions WHERE id = ?`,
    args: [id],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { ...toSummary(row), from: row.from ? String(row.from) : null };
}

export async function createSubmission(data: NewSubmission): Promise<number> {
  const result = await getDb().execute({
    sql: `INSERT INTO submissions (name, message, "from", track) VALUES (?, ?, ?, ?)`,
    args: [data.name, data.message, data.from, data.track],
  });
  return Number(result.lastInsertRowid);
}
