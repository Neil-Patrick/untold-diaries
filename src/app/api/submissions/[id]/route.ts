import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/submissions";

// GET /api/submissions/:id — one full story, including who it's from.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1)
    return NextResponse.json({ error: "Invalid story ID" }, { status: 400 });

  try {
    const submission = await getSubmission(numericId);
    if (!submission)
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    return NextResponse.json(submission);
  } catch (err) {
    console.error("Failed to load submission:", err);
    return NextResponse.json({ error: "Failed to load story" }, { status: 500 });
  }
}
