import { getSql, initializeDatabase } from "@/lib/db";

export type ActivityEventInput = {
  userId: number;
  source: string;
  eventType: string;
  description: string;
  occurredAt?: string;
  externalId?: string;
  payload?: Record<string, unknown>;
};

export type ActivityEventResult = {
  duplicate: boolean;
  eventId?: number;
  scoreBoost: number;
  newScore: number;
  newStatus: string;
};

const scoreBoosts: Record<string, number> = {
  file_uploaded: 3,
  file_updated: 1,
  slack_message: 1,
  task_completed: 8,
  github_commit: 5,
  jira_task: 8,
  ms365_document: 3,
  figma_comment: 4,
};

function scoreStatus(score: number) {
  if (score >= 80) return "Above & beyond";
  if (score >= 65) return "Well done";
  return "Needs support";
}

export async function recordActivityEvent(input: ActivityEventInput): Promise<ActivityEventResult> {
  const safeSource = input.source.trim().slice(0, 60).toLowerCase();
  const safeType = input.eventType.trim().slice(0, 80).toLowerCase();
  const safeDescription = input.description.trim().slice(0, 280);
  const safeExternalId = input.externalId?.trim().slice(0, 190) || null;
  const timestamp = input.occurredAt && !Number.isNaN(Date.parse(input.occurredAt))
    ? new Date(input.occurredAt).toISOString()
    : new Date().toISOString();

  if (!safeSource || !safeType || !safeDescription) {
    throw new Error("Activity source, type, and description are required");
  }

  await initializeDatabase();
  const sql = getSql();
  const users = await sql`SELECT id, score, status FROM users WHERE id = ${input.userId}`;
  const user = users[0] as { id: number; score: number; status: string } | undefined;
  if (!user) throw new Error("Employee not found");

  if (safeExternalId) {
    const existingRows = await sql`SELECT id FROM event_logs WHERE source = ${safeSource} AND external_id = ${safeExternalId}`;
    const existing = existingRows[0] as { id: number } | undefined;
    if (existing) {
      return { duplicate: true, eventId: existing.id, scoreBoost: 0, newScore: user.score, newStatus: user.status };
    }
  }

  const scoreBoost = scoreBoosts[safeType] ?? 1;
  const insertedRows = await sql`
    INSERT INTO event_logs (user_id, event_type, description, payload, timestamp, source, external_id)
    VALUES (${input.userId}, ${safeType}, ${safeDescription}, ${JSON.stringify(input.payload ?? {})}, ${timestamp}, ${safeSource}, ${safeExternalId})
    RETURNING id
  `;
  const inserted = insertedRows[0] as { id: number };
  const newScore = Math.min(100, user.score + scoreBoost);
  const newStatus = scoreStatus(newScore);
  await sql`UPDATE users SET score = ${newScore}, status = ${newStatus} WHERE id = ${input.userId}`;

  return { duplicate: false, eventId: inserted.id, scoreBoost, newScore, newStatus };
}
