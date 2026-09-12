import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Expect: { "employeeEmail": "...", "eventType": "...", "details": "..." }
    const email = payload.employeeEmail || "Unknown Employee";
    const type = payload.eventType || "ms365_event";
    const details = payload.details || "Action recorded in MS365";
    
    const description = `[${type}] ${details}`;
    const nameFromEmail = email.split('@')[0].replace('.', ' ');
    
    // Demo Safety Logic: Find or create user
    const stmtFind = db.prepare("SELECT id FROM users WHERE name LIKE ?");
    let user = stmtFind.get(`%${nameFromEmail}%`) as { id: number } | undefined;
    
    if (!user) {
      // Create a dummy user to prevent FK constraint crashes
      const initials = nameFromEmail.substring(0, 2).toUpperCase() || "MS";
      const stmtInsert = db.prepare(`
        INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
        VALUES (?, ?, 'Employee (Auto-created)', 'General', date('now'), 90, 50, 'Well done', '#cbd5e1')
      `);
      const info = stmtInsert.run(nameFromEmail, initials);
      user = { id: info.lastInsertRowid as number };
    }
    
    // Save EventLog
    const stmtLog = db.prepare(`
      INSERT INTO event_logs (user_id, event_type, description, payload)
      VALUES (?, 'ms365', ?, ?)
    `);
    
    stmtLog.run(user.id, description, JSON.stringify(payload));
    
    // Update score safely
    db.prepare(`UPDATE users SET score = CASE WHEN score + 2 > 100 THEN 100 ELSE score + 2 END WHERE id = ?`).run(user.id);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("MS365 Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
