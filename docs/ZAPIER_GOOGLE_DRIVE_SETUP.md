# Zapier → Boardy activity integration

This app accepts normalised work-activity events at:

`POST /api/webhooks/zapier/activity`

The endpoint stores the event, updates the employee score/status, and the manager dashboard refreshes within 15 seconds.

## Before creating the Zap

1. In Boardy, create the demo employee using **Add new staff**. This creates the database record required by the webhook.
2. Select that employee and note the **Zapier ID** displayed beneath their role.
3. Create a Google Drive folder for the demo employee, such as `Probation Evidence / Maya Chen`.
4. Create a Zapier account with access to **Webhooks by Zapier**. Webhooks by Zapier is a paid Zapier feature.
5. Generate a long random webhook secret.
6. Copy `.env.example` to `.env.local` and set `ZAPIER_WEBHOOK_SECRET` to that secret. Never commit `.env.local`.
7. Run or deploy Boardy at a public HTTPS URL. For a local demo, expose `http://localhost:3000` with a tunnel such as Cloudflare Tunnel or ngrok.

## Create the Google Drive Zap

1. In Zapier, create a Zap.
2. Select **Google Drive** as the trigger.
3. Choose **New File in Folder** for uploads, or **Updated File** for changes.
4. Connect the Google account used as the demo employee and select that employee's evidence folder.
5. Add **Webhooks by Zapier** as the action and select **POST**.
6. Set the URL to:

   `https://YOUR-PUBLIC-BOARDY-URL/api/webhooks/zapier/activity`

7. Set the payload type to JSON and add this header:

   `x-boardy-webhook-secret: YOUR_WEBHOOK_SECRET`

8. Map these body fields:

| Field | Upload value | Update value |
| --- | --- | --- |
| `userId` | The employee's displayed Zapier ID | The employee's displayed Zapier ID |
| `source` | `google_drive` | `google_drive` |
| `eventType` | `file_uploaded` | `file_updated` |
| `description` | `Uploaded {{File Name}}` | `Updated {{File Name}}` |
| `occurredAt` | Google Drive modified/created time | Google Drive modified time |
| `externalId` | `{{File ID}}-{{Created Time}}` | `{{File ID}}-{{Modified Time}}` |
| `payload.fileName` | `{{File Name}}` | `{{File Name}}` |
| `payload.fileUrl` | `{{Web View Link}}` | `{{Web View Link}}` |

The changing timestamp in `externalId` prevents retries from making duplicates while still allowing a later edit to be recorded.

## Test it

1. Open Boardy at `/dashboard` and select Maya Chen.
2. Add a small document to the selected Google Drive folder.
3. Check the Zap test/run history is successful (the endpoint returns `201`).
4. Wait up to 15 seconds, then open **Activity**. You should see the file activity with `GOOGLE DRIVE · FILE UPLOADED` below it.
5. Confirm Maya's score has increased by 3 points and her status changes if she crosses a threshold.
6. Modify the file and test the second Zap. The `file_updated` event adds 1 point.

## Local manual test

With the development server running and `ZAPIER_WEBHOOK_SECRET` configured, send a request to your local URL with the same JSON fields. The result should be a `201` response. Re-send it with the same `externalId`; Boardy returns `200` and `duplicate: true` without changing the score.

## Important deployment note

Boardy currently uses a local SQLite file (`boardy.db`). This is ideal for a local/tunnelled hackathon demo. Before deploying to a serverless host such as Vercel, move `users` and `event_logs` to a persistent hosted database; serverless local files are not reliable storage.
