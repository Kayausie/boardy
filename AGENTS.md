<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Product 
This is an AI-powered SaaS tool that will help companies HR, leaders estimate and track their new employees performance on different workspaces. The app will act as a platform for employees to log in, monitor their work procedures, estimate and send reports to HR and their leaders. The app will also use AI agent to estimate their workflow to, based on the provided template that has been trained to the agent, which will be developed throughout this project. 

## Stack
-NextJS
-TypeScript
-Tailwind
-MongoDB
-Google Gemini
-Zapier
-Workspace webhooks (GitHub, Google Drive, etc. (more is being added))
-Playwright
-Vercel

## Repository Structure
- `app/`: routes, layouts, and server endpoints
- `app/components/`: shared interface components
- `features/`: feature-specific interface and application logic
- `app/lib/`: reusable infrastructure and integrations
- `prisma/`: schema and database migrations
- `tests/`: integration and end-to-end coverage

## DO NOT
- Don't use axios — use fetch
- Don't create new directories without asking
- Don't add try/catch blocks unless the error is actually handled
- Don't install new dependencies without asking

## Commands

- Install: `npm install`
- Start development: `npm run dev`
- Lint: `npm run lint`
- End-to-end tests: `npm run test:e2e`
- Production build: `npm run build`
- Type Checking: `npm typecheck`

## Code Style

- Function declarations for top-level functions (not arrow functions)
- Always use curly braces for if/else/for/while, even one-liners
- Prefer const over let; use ternary instead of reassignment
- No comments unless the code is genuinely non-obvious
- Object parameters for functions with more than 2 arguments

## Architecture
- Keep route handlers thin.
- Put reusable business logic in `lib/`, organized by domain (for example, `lib/activity-events.ts`).
- Validate external input at system boundaries.
- Perform authorization before loading or mutating protected resources.
- Do not call the database directly from reusable interface components.
- Reuse existing domain services before creating a parallel implementation.

## Coding Conventions

- Use TypeScript for new application code.
- Prefer named exports for reusable modules; follow framework-required exports where applicable.
- Reuse existing error classes and response helpers when available. Otherwise, follow the patterns already used in the project.
- Do not introduce a state-management library without a clear need.
- Document public functions when their behavior or usage is not obvious.

## Testing Requirements
- Add or update tests for changed public behavior.
- Include authorization and validation failures where relevant.
- Prefer behavior-based assertions over private implementation details.
- Use deterministic fixtures.
- Run affected tests before the full suite.
- Report any test that could not be executed.

## Security

- Never trust user IDs, roles, prices, or usage limits supplied by the client.
- Enforce resource ownership on the server.
- Do not log access tokens, API keys, payment data, or prompt content.
- Use the existing secret-management and environment-variable system.
- Do not weaken validation or authorization to make a failing test pass.

## Database

- Do not run destructive migrations without approval.
- Preserve compatibility with existing records.
- Include a backfill plan when adding required fields.
- Do not edit an already-applied migration.
- Use transactions for operations that must succeed or fail together.


## Git Workflow

- Do not commit, push, merge, or force-push without approval.
- Do not include unrelated formatting changes.
- Keep migrations and generated files in the same change as the code that requires them.
- Summarize user-visible behavior and validation in the pull request.

## Completion Report

After completing a task, report:

- Summary of the behavior changed
- Modified files
- Important implementation decisions
- Commands executed
- Test and build results
- Acceptance criteria status
- Assumptions
- Known limitations
- Remaining risks

<!-- END:nextjs-agent-rules -->
