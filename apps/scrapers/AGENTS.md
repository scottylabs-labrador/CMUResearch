# Scrapers

Instructions for coding agents working in `apps/scrapers`. They add to the repository-wide `AGENTS.md`. `CLAUDE.md` here imports this file, so edit this one.

Python scrapers and MongoDB writers, imported from `cmu-research-backend` (see `README.md` and `UPSTREAM.md`). Commands below run from the repository root.

## Never run a writer

Every script that touches the database connects to the **real** Atlas cluster as soon as it runs, and some do on import. There is no dry-run flag or test database. Never run, or import outside the tests, any of these:

| Script | What it does to `CMUResearchDatabase` |
|---|---|
| `cmu_hcii/hciUpload.py` | Inserts HCII rows into `ResearchProjects` |
| `cmu_robotics/mango_upload.py` | Scrapes Robotics, inserts into `ResearchProjects` |
| `cmu_scholar/mango_upload.py` | Scrapes CMU Scholars, inserts into `Professors` |
| `research_opportunities/SCS.py` | Inserts the adjacent CSV into `ResearchProjects` |
| `mango_upload.py` | Inserts a sample document into `Users` |
| `delete_script.py` | **Deletes every document** in `ResearchOpportunities` |

Repeated inserts create duplicates. If a task seems to need a writer run, stop and ask.

Safe to run:
- `cmu_hcii/HCII.py` converts CSV to CSV, with no database.
- `cmu_robotics/project_scraper.py` and `cmu_scholar/scraper.py` fetch public CMU pages but don't write anything. The writers above import them.
- The tests.

## Setup and tests

```sh
python -m venv apps/scrapers/.venv
python -m pip install -r apps/scrapers/requirements.txt
python -m unittest discover -s apps/scrapers/tests -v
```

Activate the virtual environment before `pip` (`apps/scrapers/.venv/Scripts/Activate.ps1` on Windows, `source apps/scrapers/.venv/bin/activate` elsewhere). The tests replace credentials, HTTP and the Mongo client with mocks and never reach the network. Run them after any change here, and extend `tests/test_migration.py` when you change what a writer inserts.

## Conventions

- **Credentials** come from `apps/scrapers/private.json` (`{"password": ...}`), copied from `private.example.json`. It's gitignored. Never commit it, print it, or move the password into code or frontend env vars.
- **Paths** are relative to each script's own file (`Path(__file__).resolve().parent`), so scripts work from any directory. Keep it that way.
- **Field names** match what the API and frontend read: `"Project Title"`, `"Paid/Unpaid"`, `"Time Added"`, `Contact` as `{ name: andrewId-or-email }`. Check `apps/api/dbschemas/` and `toResearch()` in `apps/web/src/lib/opportunities.ts` before renaming or adding a field.
- **New scrapers** should separate scraping (producing rows, testable offline) from writing (one insert step). Don't connect to the database at import time.
- **`examples/*.py.txt`** are unfinished drafts kept as text, and `research_opportunities/ECE.py` is an empty placeholder. They aren't runnable.
- **PostgreSQL.** Writers still target MongoDB. Schema changes go in `apps/api/db/migrations/`; see `apps/api/db/README.md`.

Changes here need a code owner's approval (`.github/CODEOWNERS`).
