# CMU Research

Webapp which consolidates research opportunities across every Carnegie Mellon department, scraping data from lab specific sites, department spreadsheets and university maintained lists. This project is maintained through ScottyLabs Labrador, a student-run organization at CMU. If you are interested in learning more or contributing, contact Jarrett (jarretth@andrew.cmu.edu) or Jennifer (jzhu6@andrew.cmu.edu).

## File Structure

| Directory | Purpose |
| --- | --- |
| `apps/web` | React, TypeScript, Tailwind and Vite frontend |
| `apps/api` | Express, auth, MongoDB routes, and `dbschemas/` |
| `apps/scrapers` | Python collectors, CSV transforms, and database writers |
| `docs` | Project documentation, including the [frontend design guide](docs/frontend-design.md) |

Web and API use npm workspaces with one root `package-lock.json`. Python uses a separate virtual environment. No task runner or CI service is required.

## How to run the code

Requirements:
- Node.js 22.12+
- Python 3.11+
- Consult with Jarrett or Jennifer for the config.env settings

After cloning the repository onto your local machine, open a terminal from the repository root and install dependencies by running:

```sh
npm ci
```

Next, to start the web application, run:

```sh
npm run dev
```

The web app will run at http://localhost:3000. Since the server isn't running, no data will be connected. Copy `apps/api/config.env.example` to `apps/api/config.env` and fill in the separately supplied database and authentication settings. Then open a second terminal and run:

```sh
npm run server
```

The API runs on port 5050. Vite forwards `/api/auth/*` unchanged and strips `/api` for the other API routes. Existing API endpoints and data schemas are unchanged. Open http://localhost:3000 on your browser to view the web app. As always, send a message in the Slack channel if there are any difficulties with setup!

Other root commands:

```sh
npm run build           # output: apps/web/dist
npm run preview
npm run lint
```

See [scraper setup and writer commands](apps/scrapers/README.md). Scrapers do not run during npm installation, frontend builds, or API startup.

## PostgreSQL development tooling

To start PostgreSQL schema or writer work, follow the [local database and SQL migration setup](apps/api/db/README.md).
Use `npm run db:check` to verify your local connection and `npm run db:migrate -- up` to apply pending migrations.
The shared migration history lives in `apps/api/db/migrations/`. The API and existing scrapers still use MongoDB until their follow-up migrations are implemented.

## Migrating an existing checkout or deployment

- Frontend source, assets, and tool configuration now live in `apps/web`. Move local frontend `.env` files there.
- Move the old `server/config.env` to `apps/api/config.env`; never commit its contents.
- Deployment build commands can remain `npm ci` and `npm run build` at the repository root. Change the static output directory from `dist` to `apps/web/dist`.
- API processes can keep using root `npm run server`; direct launch commands must use the new API directory.
- External scraper schedules must be updated separately to the paths documented in the scraper README. The old backend repo is retained as historical reference; no schedules or deployments are changed by this migration.

## Reviews

Every PR to `main` requires one approval and resolved conversations, with no required CI/status checks. API, scraper, schema, GitHub configuration, and workspace dependency changes require approval from **one of** `@nicholascui225`, `@jahuang24`, or `@JennyPenguin`. Frontend-only changes can be approved by any eligible reviewer. Authors cannot approve their own PRs, and the latest push must be approved by someone else.

See [protection settings and verification](.github/PROTECTION.md). Repository access does not grant database access; credentials are distributed separately.

## Attribution

Original project leads (Fall 2024): Jennifer Zhu, Jarrett Huang, Rishi Prabhu, Lily Qin, and Bryan Huang, alongside other ScottyLabs Labrador contributors. Scraper source and attribution are recorded in [apps/scrapers/UPSTREAM.md](apps/scrapers/UPSTREAM.md).
