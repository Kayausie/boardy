import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSql, initializeDatabase } from "@/lib/db";
import { recordActivityEvent } from "@/lib/activity-events";

// Types for incoming GitHub payload
interface GitHubPushPayload {
  pusher?: { name?: string; email?: string };
  sender?: { login?: string };
  head_commit?: { id?: string; message?: string; timestamp?: string };
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
    
    await initializeDatabase();
    const sql = getSql();
    const matchingUsers = await sql`
      SELECT id FROM users WHERE name ILIKE ${`%${pusher}%`} OR initials ILIKE ${`%${pusher.substring(0, 2)}%`} LIMIT 1
    `;
    let user = matchingUsers[0] as { id: number } | undefined;
    
    if (!user) {
      // Create a dummy user to prevent FK constraint crashes (Demo Safety)
      const initials = pusher.substring(0, 2).toUpperCase() || "GH";
      const created = await sql`
        INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
        VALUES (${pusher}, ${initials}, 'Developer (Auto-created)', 'Engineering', ${new Date().toISOString().slice(0, 10)}, 90, 50, 'Well done', '#cbd5e1')
        RETURNING id
      `;
      user = created[0] as { id: number };
    }

    await recordActivityEvent({
      userId: user.id,
      source: "github",
      eventType: "github_commit",
      description,
      occurredAt: payload.head_commit?.timestamp,
      externalId: payload.head_commit?.id,
      payload: payload as Record<string, unknown>,
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("GitHub Secure Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
