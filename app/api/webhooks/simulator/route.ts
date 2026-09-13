import { recordActivityEvent } from "@/lib/activity-events";
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

    const result = await recordActivityEvent({
      userId: Number(userId),
      source: "simulator",
      eventType,
      description,
      payload,
    });

    return NextResponse.json({
      success: true,
      event: { id: result.eventId, userId, eventType, description },
      scoreBoost: result.scoreBoost,
      newScore: result.newScore,
    });
  } catch (error: any) {
    console.error("Webhook simulator error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
