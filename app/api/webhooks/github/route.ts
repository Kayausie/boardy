import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Parse GitHub payload
    const pusher = payload.pusher?.name || payload.pusher?.email || payload.sender?.login || "Unknown GitHub User";
    const commitMsg = payload.head_commit?.message || "Triggered a GitHub event";
    const repo = payload.repository?.name || "unknown-repo";
    
    const description = `Pushed to ${repo}: ${commitMsg}`;
    
    // Demo Safety Logic: Find or create user
    const stmtFind = db.prepare("SELECT id FROM users WHERE name LIKE ? OR initials LIKE ?");
    let user = stmtFind.get(`%${pusher}%`, `%${pusher.substring(0, 2)}%`) as { id: number } | undefined;
    
    if (!user) {
      // Create a dummy user to prevent FK constraint crashes
      const initials = pusher.substring(0, 2).toUpperCase() || "GH";
      const stmtInsert = db.prepare(`
        INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
        VALUES (?, ?, 'Developer (Auto-created)', 'Engineering', date('now'), 90, 50, 'Well done', '#cbd5e1')
      `);
      const info = stmtInsert.run(pusher, initials);
      user = { id: info.lastInsertRowid as number };
    }
    
    // Save EventLog
    const stmtLog = db.prepare(`
      INSERT INTO event_logs (user_id, event_type, description, payload)
      VALUES (?, 'github', ?, ?)
    `);
    
    stmtLog.run(user.id, description, JSON.stringify(payload));
    
    // Auto-update score safely
    db.prepare(`UPDATE users SET score = CASE WHEN score + 5 > 100 THEN 100 ELSE score + 5 END WHERE id = ?`).run(user.id);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("GitHub Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
