import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // In a real app, we would process the webhook, extract the timestamp and actor,
    // and store it in our database (e.g. SQLite/Prisma).
    // For this hackathon, we simulate saving the event.
    
    console.log("Received GitHub Webhook:", payload);
    
    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
