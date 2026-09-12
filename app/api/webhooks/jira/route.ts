import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Process Jira webhook (e.g. issue status transition)
    console.log("Received Jira Webhook:", payload);
    
    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
