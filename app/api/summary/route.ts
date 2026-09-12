import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { personData } = await req.json();

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "GEMINI_API_KEY is not set in environment variables." 
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are an AI HR Assistant reporting to a Senior Leader. Based on the following employee data, write a concise, realistic executive summary of their performance today. Point out any potential blockers or areas needing support. Use plain text only (no markdown like **bold**). Do not address the employee directly, address the manager.
    Name: ${personData?.name || 'Jane Doe'}
    Role: ${personData?.role || 'Developer'}
    Completed Tasks: ${personData?.tasks?.filter((t: any) => t.progress === 100).length || 0}
    Recent Activity: ${personData?.activities?.map((a: any) => a.text).join(', ') || 'None'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
