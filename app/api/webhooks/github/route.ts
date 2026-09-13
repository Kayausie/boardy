import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

// Types for incoming GitHub payload
interface GitHubPushPayload {
  pusher?: { name?: string; email?: string };
  sender?: { login?: string };
  head_commit?: { message?: string };
  repository?: { name?: string };
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized: Missing HMAC signature" }, { status: 401 });
    }

    // Read raw body for HMAC verification
    const rawBody = await req.text();
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "hackathon-secret-key-123";

    // Compute HMAC SHA256 signature securely
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(rawBody).digest("hex");

    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    // Prevent timing attacks using crypto.timingSafeEqual
    if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
      return NextResponse.json({ error: "Unauthorized: Invalid HMAC signature" }, { status: 401 });
    }

    // Process Event safely after verification
    const payload: GitHubPushPayload = JSON.parse(rawBody);

    const pusher = payload.pusher?.name || payload.pusher?.email || payload.sender?.login || "Unknown GitHub User";
    const commitMsg = payload.head_commit?.message || "Triggered a GitHub event";
    const repo = payload.repository?.name || "unknown-repo";
    
    const description = `Pushed to ${repo}: ${commitMsg}`;
    
    // Upsert equivalent logic using SQLite for Hackathon MVP
    const stmtFind = db.prepare("SELECT id FROM users WHERE name LIKE ? OR initials LIKE ?");
    let user = stmtFind.get(`%${pusher}%`, `%${pusher.substring(0, 2)}%`) as { id: number } | undefined;
    
    if (!user) {
      // Create a dummy user to prevent FK constraint crashes (Demo Safety)
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
    
    stmtLog.run(user.id, description, rawBody);
    
    // Auto-update score safely
    db.prepare(`UPDATE users SET score = CASE WHEN score + 5 > 100 THEN 100 ELSE score + 5 END WHERE id = ?`).run(user.id);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("GitHub Secure Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
