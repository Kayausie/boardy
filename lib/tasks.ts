import { getSql, initializeDatabase } from "@/lib/db";

export type TaskRecord = {
  id: number;
  user_id: number;
  task_key: string;
  title: string;
  detail: string;
  progress: number;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type SeedTask = Omit<TaskRecord, "id" | "user_id" | "created_at" | "updated_at">;

// These are intentionally small, realistic seed records for the two demo employees.
// ON CONFLICT keeps this migration safe to run on every Vercel cold start.
const demoTasks: Record<number, SeedTask[]> = {
  1: [
    { task_key: "maya-onboarding-flow", title: "Redesign the onboarding flow", detail: "Design · Core product", progress: 92, status: "In progress", due_date: "2026-09-20" },
    { task_key: "maya-usability-synthesis", title: "Run usability test synthesis", detail: "Research · Growth", progress: 100, status: "Complete", due_date: "2026-09-08" },
    { task_key: "maya-component-handoff", title: "Document component handoff", detail: "Design systems", progress: 84, status: "In progress", due_date: "2026-09-24" },
    { task_key: "maya-accessibility-audit", title: "Complete accessibility audit", detail: "Quality · Core product", progress: 96, status: "Complete", due_date: "2026-09-12" },
  ],
  2: [
    { task_key: "daniel-billing-settings", title: "Build billing settings screen", detail: "Frontend · Billing", progress: 72, status: "In progress", due_date: "2026-09-22" },
    { task_key: "daniel-mobile-navigation", title: "Resolve mobile navigation bugs", detail: "Frontend · Core product", progress: 100, status: "Complete", due_date: "2026-09-07" },
    { task_key: "daniel-component-tests", title: "Write component test coverage", detail: "Engineering quality", progress: 56, status: "In progress", due_date: "2026-09-28" },
    { task_key: "daniel-api-documentation", title: "Document the billing API", detail: "Engineering · Platform", progress: 48, status: "Needs support", due_date: "2026-09-26" },
  ],
};

function statusForScore(score: number) {
  if (score >= 80) return "Above & beyond";
  if (score >= 65) return "Well done";
  return "Needs support";
}

/** Seeds demo tasks for IDs 1 and 2 when those employees exist, then recalculates their score. */
export async function ensureDemoTasks() {
  await initializeDatabase();
  const sql = getSql();

  for (const [userIdText, tasks] of Object.entries(demoTasks)) {
    const userId = Number(userIdText);
    const users = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (!users.length) continue;

    let insertedAny = false;
    for (const task of tasks) {
      const inserted = await sql`
        INSERT INTO tasks (user_id, task_key, title, detail, progress, status, due_date)
        VALUES (${userId}, ${task.task_key}, ${task.title}, ${task.detail}, ${task.progress}, ${task.status}, ${task.due_date})
        ON CONFLICT (user_id, task_key) DO NOTHING
        RETURNING id
      `;
      insertedAny = insertedAny || inserted.length > 0;
    }

    if (!insertedAny) continue;
    const metrics = await sql`
      SELECT COALESCE(ROUND(AVG(progress)), 0)::int AS task_progress
      FROM tasks WHERE user_id = ${userId}
    `;
    const taskProgress = Number((metrics[0] as { task_progress: number }).task_progress || 0);
    await sql`UPDATE users SET score = ${taskProgress}, status = ${statusForScore(taskProgress)} WHERE id = ${userId}`;
  }
}

export async function getTasksForUsers(userIds: number[]) {
  if (!userIds.length) return [] as TaskRecord[];
  await initializeDatabase();
  const sql = getSql();
  const rows = await sql`SELECT * FROM tasks ORDER BY user_id, due_date NULLS LAST, id` as TaskRecord[];
  const ids = new Set(userIds);
  return rows.filter((task) => ids.has(Number(task.user_id)));
}

export function taskToUi(task: TaskRecord) {
  const dueDate = task.due_date ? new Date(`${task.due_date}T00:00:00`) : null;
  const due = dueDate
    ? `${task.status === "Complete" ? "Completed" : "Due"} ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "No due date";
  return {
    id: task.id,
    title: task.title,
    detail: task.detail,
    progress: task.progress,
    status: task.status,
    due,
  };
}
