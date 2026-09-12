import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, eventType, description, payload } = body;

    if (!userId || !eventType || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, eventType, description" },
        { status: 400 }
      );
    }

    const stmt = db.prepare(
      `INSERT INTO event_logs (user_id, event_type, description, payload, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`
    );
    const result = stmt.run(userId, eventType, description, payload ? JSON.stringify(payload) : "{}");

    // Update user score based on event type
    const scoreBoost =
      eventType === "github_commit" ? 5 :
      eventType === "jira_task" ? 8 :
      eventType === "ms365_document" ? 3 :
      eventType === "figma_comment" ? 4 : 2;

    db.prepare(`UPDATE users SET score = MIN(100, score + ?) WHERE id = ?`).run(scoreBoost, userId);

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as any;

    // Auto-update status based on score
    let newStatus = "Needs support";
    if (user.score >= 80) newStatus = "Above & beyond";
    else if (user.score >= 65) newStatus = "Well done";

    if (user.status !== newStatus) {
      db.prepare(`UPDATE users SET status = ? WHERE id = ?`).run(newStatus, userId);
    }

    return NextResponse.json({
      success: true,
      event: { id: result.lastInsertRowid, userId, eventType, description },
      scoreBoost,
      newScore: user.score,
    });
  } catch (error: any) {
    console.error("Webhook simulator error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
