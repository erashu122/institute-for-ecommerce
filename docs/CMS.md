# Institutional CMS

## Public pages and APIs

The public routes are /about, /faculty, /faculty/[slug], /blog, /blog/[slug], /events, /events/[slug], /testimonials and /faqs. About includes approved testimonials. FAQs use keyboard-accessible buttons with aria-expanded and aria-controls to reveal their associated answer regions.

GET /api/content/[kind] accepts search, page and a blog category ID. Page size is 8. The allowed kinds are faculty, blog, blog-categories, events, testimonials, faqs and pages. Public queries always select PUBLISHED content. The list response contains items, total, page and totalPages. Invalid filters return 400, an unknown kind returns 404, and temporary failures return a generic 503.

GET /api/content/[kind]/[slug] returns a published entry or 404. Drafts return 404. The about record uses kind pages and the fixed slug about. All public content comes from the database. Synthetic development data is available only through the explicit development seed.

## Staff workflow

/admin/content provides navigation to the seven content collections. Each collection supports search, pagination, create, edit, preview and publication status. Staff identity and current database permissions are checked on each operation, including server actions and media access.

Active Admin and Editor staff can create and edit content. Every save returns the entry to DRAFT. Admin can publish, unpublish, approve testimonials and delete. Version numbers enforce optimistic concurrency. A stale edit, publication or deletion returns a reload message rather than overwriting another staff member's changes. Blog categories referenced by posts cannot be deleted.

The shared fields are slug, title, summary, body, sortOrder, imageId, status, version and timestamps. Kind-specific Zod schemas validate faculty position and qualifications, blog author, event timestamps and venue, testimonial attribution, and About mission, vision and leadership. BlogPost has a relational categoryId. Event also has indexed UTC timestamp columns. JSON details retain the editorial fields and the original timezone-qualified event inputs.

Body content supports Markdown headings, emphasis, lists, code and safe links. Raw HTML is omitted and Markdown images are excluded. Images are attached using the validated media uploader and picker. About sections and testimonials are rendered through React escaping.

Event editors use the institute timezone, Asia/Kolkata (IST). Event values sent to services and APIs include a timezone offset and are stored as UTC instants. End time must be at or after start time.

## Image storage

Set MEDIA_STORAGE_DIR to an absolute private directory, for example C:/Projects/institute-media. The application needs read/write access. Each upload requires staff authorization, alternative text, a PNG/JPEG/WebP MIME type and a maximum source size of 5 MB. Sharp verifies the decoded format, rejects animations and images over 20 million input pixels, and re-encodes to a metadata-free WebP of at most 2000 by 2000 pixels. A 6 MB server-action body limit bounds multipart submissions.

Image files use generated UUID storage keys. Files are written with exclusive creation and are removed if metadata persistence fails. Internal storage paths stay on the server. The media picker shows the most recent 100 assets and preserves an already assigned older image. An upload is selected automatically but requires content save to attach it.

GET /api/media/[id] returns an image only when it is attached to published content or requested by active staff. Responses use no-store and nosniff headers. Unpublishing the last visible attachment removes public image access.

The current storage integration is a local filesystem. Use a persistent shared volume for a deployment that needs multiple app instances, and back it up alongside PostgreSQL. Object storage is a future integration choice. Uploaded assets are retained when content is deleted so that shared images and editorial reuse remain possible.

## Local setup and tests

Configure DATABASE_URL and Google OAuth as described in the README, and set MEDIA_STORAGE_DIR. Apply the additive migration using npm run db:migrate. Existing Course tables and data are preserved.

For synthetic local CMS content, run npm run db:seed:content -- --development. Replace sample copy with institute-approved content before launch. Existing slugs are preserved by the seed.

On Windows with PostgreSQL 18 tools, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-phase3.ps1
```

The harness applies the Phase 2 migrations, inserts a course fixture, applies the CMS migration and compares the fixture hash. It then runs lint, typecheck, unit tests, real PostgreSQL integration tests, production build and desktop/mobile browser tests, including course regressions. Test Google sessions use a disposable server secret. The temporary database and media directory are cleaned up after the run.

Real Google provider login, permanent development database configuration, persistent media storage and approved institutional copy require local setup. Hosted CI remains unverified until the workflow runs on its repository.


## Latest verification

The final Windows isolated run passed lint, typecheck, 25 unit tests, 13 PostgreSQL integration tests, production build and 12 desktop/mobile browser tests. The upgrade check confirmed the existing course fixture was unchanged. The FAQ accordion now uses explicit buttons and associated answer regions, with Enter interaction covered in both browser viewports.

## Manual local verification

- Configure the dedicated development database and Google OAuth settings, then provision approved staff. Verify approved and unapproved Google sign-in.
- Set an absolute MEDIA_STORAGE_DIR and apply all migrations. Verify Prisma migration status.
- Create a faculty draft and attach a valid image. Check staff preview and confirm the public URL and image remain unavailable until publication.
- Publish the profile, then edit it and confirm it returns to draft.
- Create a blog category and post, use Markdown formatting, and verify public search and category filtering.
- Create an event with start/end times in IST. Confirm its public date and venue, and verify invalid date ranges receive feedback.
- Edit FAQ display order and expand an answer with Enter. Approve and unpublish a testimonial.
- Recheck the course catalog, course editor and draft/public visibility.
