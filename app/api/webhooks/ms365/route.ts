import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Types for MS365 Graph Webhook Payload
interface GraphEventResource {
  id?: string;
  changeType?: string;
  resource?: string;
  resourceData?: { id?: string };
  employeeEmail?: string; // custom injected by some middle layers or standard
}

interface GraphWebhookPayload {
  value?: GraphEventResource[];
}

export async function POST(req: NextRequest) {
  try {
    // The Validation Token Trap: MS Graph sends this when establishing a subscription
    const validationToken = req.nextUrl.searchParams.get("validationToken");
    
    if (validationToken) {
      // Must return exactly the plain text validationToken and a 200 OK immediately
      return new NextResponse(validationToken, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Process Event if it's a real webhook payload
    const payload: GraphWebhookPayload = await req.json();
    
    // MS Graph API always wraps resources in a 'value' array
    const events = payload.value || [payload as GraphEventResource];
    
    for (const event of events) {
      const email = event.employeeEmail || event.resourceData?.id || "Unknown Employee";
      const type = event.changeType || "ms365_event";
      const details = event.resource || "MS365 Graph API Activity";
      
      const description = `[${type}] ${details}`;
      const nameFromEmail = email.split('@')[0].replace('.', ' ');

      // Upsert equivalent logic using SQLite for Hackathon MVP
      const stmtFind = db.prepare("SELECT id FROM users WHERE name LIKE ?");
      let user = (stmtFind.get(`%${nameFromEmail}%`)) as { id: number } | undefined;
      
      if (!user) {
        // Create a dummy user to prevent FK constraint crashes (Demo Safety)
        const initials = nameFromEmail.substring(0, 2).toUpperCase() || "MS";
        const stmtInsert = db.prepare(`
          INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
          VALUES (?, ?, 'Employee (Auto-created)', 'General', date('now'), 90, 50, 'Well done', '#cbd5e1')
        `);
        const info = stmtInsert.run(nameFromEmail, initials);
        user = { id: info.lastInsertRowid as number };
      }

      // Save EventLog
      db.prepare(`
        INSERT INTO event_logs (user_id, event_type, description, payload)
        VALUES (?, 'ms365', ?, ?)
      `).run(user.id, description, JSON.stringify(event));

      // Update score safely
      db.prepare(`UPDATE users SET score = CASE WHEN score + 2 > 100 THEN 100 ELSE score + 2 END WHERE id = ?`).run(user.id);
    }

    // Microsoft best practice for webhook processing: 202 Accepted
    return NextResponse.json({ message: "Accepted" }, { status: 202 });
  } catch (error: any) {
    console.error("MS365 Graph Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
