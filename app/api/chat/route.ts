import { getSql, initializeDatabase } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userId, viewRole = "Manager" } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    await initializeDatabase();
    const sql = getSql();
    // RAG: Retrieve user data and events from the shared database.
    const userRows = userId ? await sql`SELECT * FROM users WHERE id = ${Number(userId)}` : [];
    const user = userRows[0] as any;
    const events = userId
      ? await sql`SELECT * FROM event_logs WHERE user_id = ${Number(userId)} ORDER BY timestamp DESC LIMIT 30` as any[]
      : [];
    const pastSummaries = userId
      ? await sql`SELECT * FROM summaries WHERE user_id = ${Number(userId)} ORDER BY created_at DESC LIMIT 5` as any[]
      : [];

    // Build RAG context
    const eventsContext = events.map((e: any) => {
      const payload = JSON.parse(e.payload || "{}");
      return `[${e.timestamp}] ${e.event_type}: ${e.description} | ${JSON.stringify(payload)}`;
    }).join("\n");

    const summariesContext = pastSummaries.map((s: any) =>
      `[${s.created_at}] ${s.role} Summary:\n${s.content}`
    ).join("\n\n");

    let systemPrompt = `You are OnboardPilot (Boardy), an AI Assistant for HR and Senior Leaders/Managers. 
You help them analyze their new employees' onboarding progress, identify blockers, and suggest management actions.
Be professional, concise, and insightful. Use markdown formatting for readability.

IMPORTANT CONTEXT: You have access to real-time data from the employee's integrated tools (GitHub, Jira, MS 365, Slack). Use this data to give accurate, data-driven answers.`;

    if (user) {
      systemPrompt += `\n\n═══ EMPLOYEE PROFILE (from Database) ═══
Name: ${user.name}
Role: ${user.role}
Department: ${user.department}
Start Date: ${user.start_date}
Probation Days Remaining: ${user.remaining}
AI Performance Score: ${user.score}/100
Current Status: ${user.status}`;
    }

    if (eventsContext) {
      systemPrompt += `\n\n═══ RECENT EVENT LOGS (RAG Retrieved from the database) ═══\n${eventsContext}`;
    }

    if (summariesContext) {
      systemPrompt += `\n\n═══ PAST AI SUMMARIES ═══\n${summariesContext}`;
    }

    if (viewRole === "HR") {
      systemPrompt += `\n\nROLE CONTEXT (HR): You are speaking to an HR professional. Focus on the employee's onboarding experience, well-being, culture fit, and general progress. Avoid getting bogged down in deep technical details (like code additions or specific Jira bugs) unless they signal a major blocker. Your tone should be supportive and people-centric.`;
    } else {
      systemPrompt += `\n\nROLE CONTEXT (Manager): You are speaking to a Manager. Focus on the employee's technical output, velocity, blockers, task completion, and concrete deliverables. Highlight specific data points from GitHub, Jira, and Slack. Your tone should be analytical, objective, and performance-oriented.`;
    }

    systemPrompt += `\n\nUse ALL the above data to answer the user's questions accurately. If they ask about activity, tasks, or progress, reference the specific event logs.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

    // Build chat history for Gemini (skip the first initial assistant greeting to prevent model-model role collision)
    const historyMessages = messages.length > 0 && messages[0].content.startsWith("Hi, I'm your AI")
      ? messages.slice(1, -1)
      : messages.slice(0, -1);
      
    const chatHistory = historyMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I have access to the employee's real-time data from the database. I'm ready to help you analyze their onboarding progress. What would you like to know?" }] },
        ...chatHistory,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
