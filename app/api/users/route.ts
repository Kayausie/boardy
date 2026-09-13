import { getSql, initializeDatabase } from "@/lib/db";
import { ensureDemoTasks, getTasksForUsers } from "@/lib/tasks";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Fetch all users
export async function GET() {
  try {
    await initializeDatabase();
    await ensureDemoTasks();
    const users = await getSql()`SELECT * FROM users ORDER BY id`;
    const tasks = await getTasksForUsers(users.map((user) => Number(user.id)));
    const usersWithTasks = users.map((user) => {
      const userTasks = tasks.filter((task) => Number(task.user_id) === Number(user.id));
      const overallProgress = userTasks.length
        ? Math.round(userTasks.reduce((sum, task) => sum + Number(task.progress), 0) / userTasks.length)
        : 0;
      return {
        ...user,
        tasks: userTasks,
        overall_progress: overallProgress,
        completed_tasks: userTasks.filter((task) => Number(task.progress) === 100).length,
        task_count: userTasks.length,
      };
    });
    return NextResponse.json({ success: true, users: usersWithTasks });
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

    await initializeDatabase();
    const users = await getSql()`
      INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color)
      VALUES (${name}, ${initials}, ${role || "New Member"}, ${department || "General"}, ${startDate || new Date().toISOString().split("T")[0]}, 60, 0, 'Needs support', ${color})
      RETURNING *
    `;
    const user = users[0];
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
