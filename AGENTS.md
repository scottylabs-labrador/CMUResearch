# CMU Research

Instructions for coding agents working in this repository. `CLAUDE.md` imports this file, so edit this one.

A site that collects CMU research opportunities in one place. An npm-workspaces monorepo; read `README.md` for setup.

| Directory | What it is |
|---|---|
| `apps/web` | React, TypeScript, Tailwind and Vite frontend (port 3000) |
| `apps/api` | Express API with better-auth and MongoDB (port 5050). PostgreSQL migrations in `db/migrations/` |
| `apps/scrapers` | Python scrapers and database writers. Read `apps/scrapers/AGENTS.md` before touching anything there |
| `docs` | `frontend-design.md`: tokens, components, page patterns and design decisions |

## Commands

Run npm commands from the repository root, not inside `apps/*`.

```sh
npm ci                # install (one lockfile for web and API)
npm run dev           # web app
npm run server        # API; needs apps/api/config.env
npm run build         # production build of the web app
npm run lint          # ESLint
npm run db:check      # PostgreSQL connection check; needs DATABASE_URL
```

**Checking a change.** There is no CI. ESLint only lints `.js`/`.jsx`, and TypeScript isn't installed, so nothing type-checks the `.tsx` code and `vite build` doesn't either. Run `npm run build` and `npm run lint`, then check the change in the browser. For scraper changes, run the Python tests (see `apps/scrapers/AGENTS.md`).

**Mock mode.** To run the frontend without the API or sign-in, put `VITE_DEV_BYPASS_AUTH=true` (and optionally `VITE_DEV_MOCK_ROLE=professor`) in `apps/web/.env.local`. The app then uses a mock user and mock listings from `apps/web/src/data/devMock*.ts`. It only exists under `npm run dev`. Saves still go to the real API.

## Don't

- Commit secrets: `apps/api/config.env`, `.env*` files or `apps/scrapers/private.json`. All are gitignored; keep it that way.
- Run scraper writers or `delete_script.py`. They write to the real database.
- Push to `main` or force-push. Open a PR (see below).
- Remove the sign-in bypass in `apps/web/src/App.tsx` (`REMEMBER TO REMOVE`) without asking. It currently skips the sign-in page for everyone, including in production builds.

## Frontend

Read `docs/frontend-design.md` before changing UI, and update it in the same PR when you change a token, a shared component or a page pattern.

- Use the token classes (`bg-canvas`, `text-ink-muted`, `bg-accent-strong`), never raw hex values.
- Spacing and radii are in pixels on a 4px grid (`p-4` = 16px), not Tailwind's default rem steps. The root font size is 14px.
- Build from `src/components/ui/` (`Button`, `ButtonLink`, `Surface`, `Modal`, …). Icons beside text come from `src/components/ui/icons.tsx`.
- `src/pages/deprecatedMainPage.tsx` is unrouted and kept for reference. Don't build on it.

## API and data

- Listings live in MongoDB `CMUResearchDatabase.ResearchProjects`, with human-readable field names (`"Project Title"`, `"Paid/Unpaid"`). `toResearch()` in `apps/web/src/lib/opportunities.ts` maps them to the frontend shape. Schemas are in `apps/api/dbschemas/`.
- Contacts are stored as `{ name: andrewId-or-email }`. `GET /opportunities/professor/:andrew_id` matches on the keys, so the frontend filters the full list by value instead.
- Only the `/users` routes require a session (`requireAuth`). `POST`, `PATCH` and `DELETE` on `/opportunities` don't check auth.
- The move to PostgreSQL is in progress: migrations and `db:check` exist, but the API and scrapers still use MongoDB. See `apps/api/db/README.md`.

## Known issues

- `apps/web/src/lib/opportunities.ts`, `lib/professors.ts` and `lib/authClient.ts` hardcode `localhost` URLs instead of going through the `/api` proxy.
- The Year sort on the search page is shown but doesn't sort.
- `GET /users/recommended` reads the `ResearchOpportunities` collection, but listings live in `ResearchProjects`.

## Git and PRs

- `main` is protected: one approval, and the latest push must be approved by someone other than its pusher. Authors can't approve their own PRs.
- Changes to `apps/api`, `apps/scrapers`, `.github`, `package.json` files, the lockfile or `.gitignore` need a code owner's approval (`.github/CODEOWNERS`).
- Keep each PR to one change. Don't commit or push unless asked.
