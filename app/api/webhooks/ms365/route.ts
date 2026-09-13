import { NextRequest, NextResponse } from "next/server";
import { getSql, initializeDatabase } from "@/lib/db";
import { recordActivityEvent } from "@/lib/activity-events";

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

      await initializeDatabase();
      const sql = getSql();
      const matchingUsers = await sql`SELECT id FROM users WHERE name ILIKE ${`%${nameFromEmail}%`} LIMIT 1`;
      let user = matchingUsers[0] as { id: number } | undefined;
      
      if (!user) {
        // Create a dummy user to prevent FK constraint crashes (Demo Safety)
        const initials = nameFromEmail.substring(0, 2).toUpperCase() || "MS";
        const created = await sql`
          INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
          VALUES (${nameFromEmail}, ${initials}, 'Employee (Auto-created)', 'General', ${new Date().toISOString().slice(0, 10)}, 90, 50, 'Well done', '#cbd5e1')
          RETURNING id
        `;
        user = created[0] as { id: number };
      }

      await recordActivityEvent({
        userId: user.id,
        source: "ms365",
        eventType: "ms365_document",
        description,
        externalId: event.id ?? event.resourceData?.id,
        payload: event as Record<string, unknown>,
      });
    }

    // Microsoft best practice for webhook processing: 202 Accepted
    return NextResponse.json({ message: "Accepted" }, { status: 202 });
  } catch (error: any) {
    console.error("MS365 Graph Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
