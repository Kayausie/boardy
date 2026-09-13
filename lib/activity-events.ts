import db from "@/lib/db";

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
  eventId?: number | bigint;
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

export function recordActivityEvent(input: ActivityEventInput): ActivityEventResult {
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(input.userId);
  if (!user) throw new Error("Employee not found");

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

  if (safeExternalId) {
    const existing = db.prepare(
      "SELECT id FROM event_logs WHERE source = ? AND external_id = ?"
    ).get(safeSource, safeExternalId) as { id: number } | undefined;

    if (existing) {
      const current = db.prepare("SELECT score, status FROM users WHERE id = ?").get(input.userId) as { score: number; status: string };
      return { duplicate: true, eventId: existing.id, scoreBoost: 0, newScore: current.score, newStatus: current.status };
    }
  }

  const scoreBoost = scoreBoosts[safeType] ?? 1;
  const insert = db.prepare(
    `INSERT INTO event_logs (user_id, event_type, description, payload, timestamp, source, external_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.userId,
    safeType,
    safeDescription,
    JSON.stringify(input.payload ?? {}),
    timestamp,
    safeSource,
    safeExternalId,
  );

  db.prepare("UPDATE users SET score = MIN(100, score + ?) WHERE id = ?").run(scoreBoost, input.userId);
  const updatedUser = db.prepare("SELECT score FROM users WHERE id = ?").get(input.userId) as { score: number };
  const newStatus = scoreStatus(updatedUser.score);
  db.prepare("UPDATE users SET status = ? WHERE id = ?").run(newStatus, input.userId);

  return { duplicate: false, eventId: insert.lastInsertRowid, scoreBoost, newScore: updatedUser.score, newStatus };
}
