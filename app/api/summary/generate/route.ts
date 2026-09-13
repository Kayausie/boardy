import { getSql, initializeDatabase } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body; // role: "HR" or "Manager"

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    await initializeDatabase();
    const sql = getSql();
    // Fetch user data from DB
    const userRows = await sql`SELECT * FROM users WHERE id = ${Number(userId)}`;
    const user = userRows[0] as any;
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fetch recent events (last 48 hours)
    const events = await sql`
      SELECT * FROM event_logs
      WHERE user_id = ${Number(userId)} AND timestamp >= NOW() - INTERVAL '2 days'
      ORDER BY timestamp DESC
    ` as any[];

    const tasks = await sql`
      SELECT title, detail, progress, status, due_date
      FROM tasks WHERE user_id = ${Number(userId)} ORDER BY due_date NULLS LAST, id
    ` as any[];

    // Build the event context string
    const eventsContext = events.map((e: any) => {
      const payload = JSON.parse(e.payload || "{}");
      return `[${e.timestamp}] ${e.event_type}: ${e.description} | Metadata: ${JSON.stringify(payload)}`;
    }).join("\n");
    const tasksContext = tasks.map((task: any) =>
      `- ${task.title}: ${task.progress}% (${task.status})${task.due_date ? ` · due ${task.due_date}` : ""}`
    ).join("\n");

    // Build role-specific prompt
    let prompt: string;

    if (role === "HR") {
      prompt = `You are an AI HR Assistant generating a summary for the HR department.
      
Employee Profile:
- Name: ${user.name}
- Role: ${user.role}
- Department: ${user.department}
- Started: ${user.start_date}
- Days Remaining in Probation: ${user.remaining}
- Current AI Score: ${user.score}/100
- Status: ${user.status}

Assigned Tasks:
${tasksContext || "No assigned tasks recorded."}

Recent Activity Log (from integrated tools):
${eventsContext || "No recent activity recorded."}

Write a NON-TECHNICAL summary for HR focusing on:
1. General onboarding progress and engagement level
2. Employee well-being indicators (are they active? or silent?)
3. Key milestones reached
4. Any concerns about pacing or engagement
5. Recommended next steps for the HR team

Keep it warm, professional, and actionable. Use markdown formatting.`;
    } else {
      prompt = `You are an AI Technical Lead Assistant generating a summary for a Senior Engineering Manager.
      
Employee Profile:
- Name: ${user.name}
- Role: ${user.role}
- Department: ${user.department}
- Started: ${user.start_date}
- Days Remaining in Probation: ${user.remaining}
- Current AI Score: ${user.score}/100
- Status: ${user.status}

Assigned Tasks:
${tasksContext || "No assigned tasks recorded."}

Recent Activity Log (from integrated tools):
${eventsContext || "No recent activity recorded."}

Write a TECHNICAL summary for the Manager focusing on:
1. Code/work output analysis (commits, PRs, tasks completed)
2. Blockers identification (any tasks stuck for too long? low activity periods?)
3. Collaboration patterns (response times, comment frequency)
4. Technical growth trajectory
5. Specific actionable recommendations (e.g., "Schedule pair-programming session on billing module")

Be direct, data-driven, and specific. Use markdown formatting.`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();

    // Save summary to DB
    await sql`INSERT INTO summaries (user_id, role, content) VALUES (${Number(userId)}, ${role || "Manager"}, ${summaryText})`;

    return NextResponse.json({ success: true, summary: summaryText, role: role || "Manager" });
  } catch (error: any) {
    console.error("Summary generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
