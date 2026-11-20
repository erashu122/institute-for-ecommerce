# Task backlog

| Phase | Developer 1 | Developer 2 | Developer 3 | Status |
| --- | --- | --- | --- | --- |
| 1 | Responsive homepage and navigation | Prisma configuration and baseline | Initial lint, Vitest and Playwright setup | Recovered foundation verified; dedicated local database configuration pending. |
| 2 | Course listing, filters and details | Course migrations, CRUD, public APIs and staff authorization | Protected course editor, publishing and workflow tests | Implemented and verified on isolated PostgreSQL; local database and real Google OAuth setup pending |
| 3 | About, faculty, blog, events and FAQs | Content schema, publication services and validation | CMS editor, media integration and regression tests | Implemented and verified on isolated PostgreSQL; permanent database, Google OAuth and media storage setup pending |
| 4 | Inquiry and admission forms | Validated intake, storage and workflow status history | Staff queues and end-to-end tests | Pending |
| 5 | Accessibility and SEO review | Migration and recovery verification | Staging QA and release coordination | Pending |

A prior recovery verification passed the app checks and applied the baseline on an isolated PostgreSQL instance. The dedicated local development database requires securely supplied credentials.




## Phase 2 verification on 20 November 2026

The isolated Windows course harness passed lint, typecheck, 17 Vitest unit tests, 6 PostgreSQL integration tests, production build and 6 Playwright desktop/mobile tests. Both migrations applied and migration status was up to date. Browser tests exercised course creation, editing, preview, publication, unpublication and deletion. An initial dropdown locator failure was corrected before the successful run.

The dedicated local DATABASE_URL, Google OAuth client settings, session secret and approved staff account still require local configuration. The automated staff browser tests used encrypted sessions issued with a disposable test secret. Real Google OAuth login remains a manual verification step. CI was updated but has not run on a remote host.



## Phase 3 verification

The final isolated run passed lint, typecheck, 25 unit tests, 13 PostgreSQL integration tests, production build and 12 desktop/mobile Playwright tests. It applied 0003_content on top of Phase 2 and confirmed an existing Course row had the same hash after migration.

The tests cover faculty editing and public visibility, blog uniqueness/category relationships, event UTC storage and IST editor conversion, testimonial approval, FAQ order/pagination and keyboard interaction, role failures, stale-version protection, image validation and unpublished media access. Course CRUD and homepage regression tests also passed.

An initial FAQ keyboard failure was resolved with an explicit button accordion using aria-expanded and aria-controls. A duplicate validation declaration found during an intermediate typecheck was removed before the successful final run.

Local activation still needs a dedicated DATABASE_URL, Google OAuth settings and approved staff, an absolute persistent MEDIA_STORAGE_DIR, and institute-approved copy. Real Google OAuth login and hosted CI remain unverified. Phase 4 is pending.

## Local database connection verified

The configured local institute_dev database accepted an authenticated connection. All three migrations applied successfully and Prisma reported the schema up to date. The running app returned HTTP 200 for /api/courses, /api/content/faculty, /about and /courses. The public API lists currently contain zero records. Local environment credentials remain in the ignored .env file.
