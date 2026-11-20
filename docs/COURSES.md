# Course API and test contracts

## Public reads

GET /api/courses accepts search (up to 100 characters), category (category slug), mode (ONLINE, CLASSROOM or HYBRID), and page (positive integer up to 10000). Omitted filters match all published courses. The page size is 6. Responses contain items, total, page, pageSize and totalPages.

GET /api/courses/[slug] returns a published course or a 404. Drafts also return 404. Invalid list filters return 400, while temporary database failures return a generic 503. Public pages use the same feature service. All course and staff routes use uncached request-time reads.

## Staff operations

/admin/courses and its nested editor and preview routes require an active staff database record and a valid Auth.js Google session. Server actions independently enforce the same permissions. Admin and Editor can read and save courses. Only Admin can publish, unpublish and delete.

Course input includes title, slug, summary, description, categoryId, duration, mode, eligibility, curriculum, outcomes, fee and an optional HTTPS image URL. Slugs use lowercase words separated by hyphens. Curriculum and outcomes are bounded string arrays. Fee is a nonnegative decimal string with at most two decimal places, denominated in INR. Status is changed through a separate authorized operation. New courses always start as drafts.

Unique database constraints enforce course slugs and category names/slugs. Known validation and uniqueness failures return user-facing errors. Unexpected mutation failures return a generic message. Server actions use Next.js origin checks. Auth.js handles OAuth state and verified Google identity, and staff access is checked from the database on each operation.

## Verification

- npm test runs pure validation and permission tests.
- npm run test:integration runs the real PostgreSQL course workflows. It requires INSTITUTE_TEST_DATABASE=1 and DATABASE_URL pointing at an isolated disposable database.
- npm run test:e2e runs desktop/mobile homepage and course workflows against a production build. Course workflow tests require INSTITUTE_TEST_DATABASE=1, DATABASE_URL, AUTH_SECRET, test Google provider settings and an approved synthetic test staff account. They use a signed test session cookie generated with the test server secret, and never contact Google. Real Google login still needs a manual check.
- Manual checks cover Google sign-in with an approved account, rejection of an unapproved account, staff role revocation, draft preview and real institute content before launch.

## Verification result on 20 November 2026

The Windows test harness in scripts/test-phase2.ps1 passed all 17 unit, 6 integration and 6 desktop/mobile browser tests along with lint, typecheck and production build. Authentication within browser tests uses an encrypted cookie generated with the disposable test server secret, while production uses the configured Google OAuth provider. Real provider sign-in and the institute's permanent local database connection remain unverified.
