# Boardy

Boardy is an AI-assisted onboarding dashboard for HR teams and managers. It brings together work-activity events, onboarding tasks, and employee profiles so teams can review progress and generate role-specific summaries.

> **Prototype notice:** Boardy is an early-stage prototype. It does not currently include authentication or organization-level access controls. Do not use it with confidential employee data or as the sole basis for hiring, performance, or employment decisions. Activity signals are incomplete and should be interpreted with care.

## What it does

- Shows employee profiles, onboarding tasks, activity, and progress indicators in a dashboard.
- Accepts activity events through webhooks and updates the dashboard's score and status.
- Uses Google Gemini to generate HR- and manager-focused summaries and answer questions using recorded activity and task data.
- Provides a documented Zapier workflow that sends Google Drive file activity to Boardy.

## Stack

- **Application:** Next.js 16, React 19, TypeScript
- **Styling and UI:** Tailwind CSS 4, Framer Motion, Lucide React
- **Charts and rich text:** Recharts, React Markdown
- **Database:** Neon serverless PostgreSQL using `@neondatabase/serverless` and SQL
- **AI:** Google Gemini through `@google/generative-ai`
- **Integrations:** Zapier webhooks; prototype endpoints for GitHub, Jira, and Microsoft 365
- **Testing:** Playwright end-to-end tests

The application connects to PostgreSQL at runtime. The Prisma schema is a reference for a possible production data model, while the SQLite seed script is a demo artifact; neither is the active application database path.

## Getting started

### Requirements

- Node.js
- pnpm
- A Neon PostgreSQL database (or another compatible PostgreSQL connection)
- A Google Gemini API key for AI summaries and chat

### Install and configure

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Set the following values in `.env.local`:

   ```dotenv
   DATABASE_URL="your Neon PostgreSQL connection string"
   GEMINI_API_KEY="your Google Gemini API key"
   ```

   The database layer also accepts `STORAGE_URL` if that is the variable name provided by your hosting integration. Set `ZAPIER_WEBHOOK_SECRET` if you want to receive Zapier activity events. Keep secrets out of source control.

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). The dashboard is at `/dashboard`.

The app creates its PostgreSQL tables when API routes initialize the database. AI endpoints return an error when `GEMINI_API_KEY` is not configured.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local development server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler without emitting files |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server after building |

There is not currently a unit-test script in `package.json`.

## Integrations

### Zapier and Google Drive

Boardy exposes `POST /api/webhooks/zapier/activity` for normalized activity events. Configure `ZAPIER_WEBHOOK_SECRET` on the server and send it in the `x-boardy-webhook-secret` header. The endpoint accepts an employee ID, source, event type, description, and optional timestamp, external ID, and payload. Repeated external IDs are treated as duplicates.

See [the Google Drive and Zapier setup guide](docs/ZAPIER_GOOGLE_DRIVE_SETUP.md) for the end-to-end configuration and payload mapping. For a Zapier webhook to reach a local development server, the server needs a publicly reachable HTTPS URL, such as one provided by a tunnel.

### Other webhook endpoints

- `POST /api/webhooks/github` accepts signed GitHub push events.
- `POST /api/webhooks/ms365` contains a Microsoft Graph webhook handler.
- `POST /api/webhooks/jira` is currently a placeholder that logs the payload; it does not yet persist Jira activity.
- `POST /api/webhooks/simulator` creates demo activity from the dashboard.

The GitHub and Microsoft 365 handlers are prototype integrations and should be reviewed and secured before production use.

## Project layout

```text
app/
  api/                 API routes, including AI and webhook endpoints
  components/          Dashboard views and reusable UI components
  dashboard/           Dashboard page
  page.tsx             Marketing/landing page
lib/
  activity-events.ts   Event persistence and score updates
  db.ts                PostgreSQL connection and schema initialization
  tasks.ts             Task data helpers
docs/                  Integration setup guides
e2e/                   Playwright end-to-end tests
prisma/                Reference schema and legacy seed data
```

## Current limitations

- No authentication, authorization, or tenant isolation is implemented.
- The score is a simple activity-based prototype metric, not a validated performance assessment.
- Some integrations are placeholders or demos; the Jira endpoint currently only logs events.
- The email endpoint renders a preview; it does not send email.
- The repository has end-to-end tests but no unit-test command configured.

## Deployment

The repository includes Vercel-oriented environment variable notes and a Neon database connection layer. Before deploying with real employee data, add and verify authentication, authorization, tenant isolation, webhook protections, privacy controls, and appropriate retention practices. Configure `DATABASE_URL` (or `STORAGE_URL`) and `GEMINI_API_KEY` in the deployment environment; add integration secrets only for integrations you enable.
