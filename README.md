# Institute for Ecommerce

The recovered application includes a responsive public homepage, course management, Google staff authentication and an institutional CMS. Local database, OAuth and media storage configuration are required. Inquiries and admissions are planned. These planning files were recreated from the agreed requirements after recovery.

## Local setup

Use Node.js 24 and npm 11. From this directory in PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [localhost:3000](http://localhost:3000). The homepage runs without a database.

## Local PostgreSQL

Use native PostgreSQL or an existing local PostgreSQL installation. Ask the local PostgreSQL administrator to provision a dedicated development database, such as institute_dev, owned by a dedicated login. Use a separate database for tests. Enter credentials locally in an ignored .env file and URL-encode reserved characters in the password. The shell DATABASE_URL takes precedence over .env.

```powershell
Copy-Item .env.example .env
notepad .env
npm.cmd run db:validate
npm.cmd run db:migrate
npm.cmd run db:status
```

Set the actual DATABASE_URL before running migration commands. The current migrations create course, staff and institutional content tables.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright serves the production build on port 3100. Run npm.cmd run start to serve it manually.

## Planning

- [Repository guidance](AGENTS.md)
- [Requirements](docs/SRS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Tasks](docs/TASKS.md)

## Phase 2 course management

The course module includes published-only public pages and APIs, staff course editing, draft preview, admin publishing and deletion, and an additive migration. Fees use INR. Text fields render as plain text. Admin and Editor can edit courses; only Admin can publish, unpublish or delete. Staff sessions are checked against the current database role and active state on each protected operation.

### Database and sample courses

After configuring the dedicated local DATABASE_URL, apply migrations and optionally add synthetic development courses:

```powershell
npm.cmd run db:migrate
npm.cmd run db:status
npm.cmd run db:seed
```

The seed preserves existing course slugs and labels its descriptions as synthetic development content. Use it only in a development database. Categories are provisioned by this seed or by the database administrator.

### Google staff login

Create a Google OAuth web client and configure its callback to match the dev server port, for example http://localhost:3000/api/auth/callback/google. Set AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET and AUTH_URL in the ignored local .env. Restart the server after editing it. Provision approved staff using the dedicated database connection:

```powershell
npm.cmd run staff:provision -- approved-account@example.com ADMIN
```

Use EDITOR for staff who edit course content. Each account must sign in with its verified Google email. Revoking active access or changing a role takes effect on subsequent protected requests. Provisioning is an operator command and has no public registration endpoint.

Visit /courses to browse published courses and /admin/courses to manage courses. Enquire Now and Apply Now currently lead to explicitly labeled intake placeholders. The admission and inquiry workflows belong to a later phase.

See [course API and test contracts](docs/COURSES.md) for request formats and validation.

### Reproduce the isolated Windows verification

With PostgreSQL 18 tools installed and Chromium available:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-phase2.ps1
```

The harness creates a disposable cluster on port 55432, applies migrations, seeds synthetic courses and test staff, runs checks and then stops and removes that temporary cluster. It uses port 3100 for browser tests. It does not configure the institute's permanent development database. For a different installation, pass -PostgresBin followed by its bin directory.

The last isolated run on 20 November 2026 passed 17 unit tests, 6 integration tests and 6 browser tests, plus lint, typecheck and production build. Local database and real Google OAuth login verification are pending.


## Phase 3 institutional CMS

Public pages cover About, faculty, blog, events, testimonials and FAQs. Staff manage them at /admin/content. See [CMS contracts and verification](docs/CMS.md).

Add an absolute MEDIA_STORAGE_DIR in the ignored .env file, for example C:/Projects/institute-media, and restart the server. The current media integration stores validated WebP images on a private local filesystem. Production hosting needs persistent storage.

```powershell
npm.cmd run db:migrate
npm.cmd run db:status
# Optional synthetic content for development
npm.cmd run db:seed:content -- --development
npm.cmd run dev
```

For an isolated test run that preserves a course fixture across the CMS migration:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-phase3.ps1
```

This runs the CMS and course regression suites using temporary database, media storage and test sessions. Real Google login and the permanent local database are separate manual setup checks.

### Current CMS verification

The final isolated run passed lint, typecheck, 25 unit tests, 13 database integration tests, 12 desktop/mobile browser tests and production build. The CMS migration preserved an existing course fixture. The permanent local .env and Google OAuth configuration remain pending, along with a persistent MEDIA_STORAGE_DIR. See docs/CMS.md for the manual checklist.
