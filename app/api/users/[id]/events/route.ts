import { getSql, initializeDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/[id]/events - Fetch events for a user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initializeDatabase();
    const events = await getSql()`SELECT * FROM event_logs WHERE user_id = ${Number(id)} ORDER BY timestamp DESC`;
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
