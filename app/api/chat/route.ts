import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { messages, employeeContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "GEMINI_API_KEY is not set in environment variables." 
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    let systemPrompt = "You are OnboardPilot, an AI Assistant for HR and Senior Leaders. Your job is to help them analyze their new employees' onboarding progress, identify blockers, and suggest management actions. Be professional, concise, and insightful. IMPORTANT: Do NOT use markdown like **bold**, use plain text only.";
    
    if (employeeContext) {
      systemPrompt += `\n\nYou are currently analyzing this employee:\nName: ${employeeContext.name}\nRole: ${employeeContext.role}\nDepartment: ${employeeContext.department}\nStatus: ${employeeContext.status}\n\nTasks:\n${JSON.stringify(employeeContext.tasks, null, 2)}\n\nRecent Activities:\n${JSON.stringify(employeeContext.activities, null, 2)}\n\nUse this context to answer the Leader's questions about this employee.`;
    }

    const history = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to assist the Leader.' }] },
        ...history.slice(0, -1) // Exclude the latest user message
      ]
    });

    const latestMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
