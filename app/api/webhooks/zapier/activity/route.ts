import { recordActivityEvent } from "@/lib/activity-events";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";

function hasValidSecret(request: NextRequest) {
  const expected = process.env.ZAPIER_WEBHOOK_SECRET;
  const received = request.headers.get("x-boardy-webhook-secret");

  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function GET() {
  return NextResponse.json({
    name: "Boardy Zapier activity webhook",
    method: "POST",
    requiredHeaders: ["x-boardy-webhook-secret"],
    requiredFields: ["userId", "source", "eventType", "description"],
    optionalFields: ["occurredAt", "externalId", "payload"],
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.ZAPIER_WEBHOOK_SECRET) {
    return NextResponse.json(
      { success: false, error: "Webhook is not configured. Set ZAPIER_WEBHOOK_SECRET on the server." },
      { status: 503 },
    );
  }

  if (!hasValidSecret(request)) {
    return NextResponse.json({ success: false, error: "Invalid webhook secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userId = Number(body.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ success: false, error: "userId must be a positive integer" }, { status: 400 });
    }

    if (typeof body.source !== "string" || typeof body.eventType !== "string" || typeof body.description !== "string") {
      return NextResponse.json(
        { success: false, error: "source, eventType, and description must be strings" },
        { status: 400 },
      );
    }

    const result = recordActivityEvent({
      userId,
      source: body.source,
      eventType: body.eventType,
      description: body.description,
      occurredAt: typeof body.occurredAt === "string" ? body.occurredAt : undefined,
      externalId: typeof body.externalId === "string" ? body.externalId : undefined,
      payload: body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload : undefined,
    });

    return NextResponse.json({ success: true, ...result }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process activity";
    const status = message === "Employee not found" ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
