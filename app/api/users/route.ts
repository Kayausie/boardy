import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Fetch all users
export async function GET() {
  try {
    const users = db.prepare(`SELECT * FROM users ORDER BY id`).all();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, department, startDate } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const names = name.split(" ");
    const initials = (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase();
    const colors = ["#d9e9ff", "#ffe6c7", "#e9dcff", "#d5f0df", "#ffe1eb", "#e2e8f0"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const result = db.prepare(
      `INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color) VALUES (?, ?, ?, ?, ?, 60, 0, 'Needs support', ?)`
    ).run(name, initials, role || "New Member", department || "General", startDate || new Date().toISOString().split("T")[0], color);

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
