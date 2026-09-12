import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/[id]/events - Fetch events for a user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const events = db.prepare(`SELECT * FROM event_logs WHERE user_id = ? ORDER BY timestamp DESC`).all(Number(id));
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
