# Architecture

## Implemented foundation

A single Next.js App Router application uses src/app for routes, src/app/(public) for the public layout and homepage, and src/components/layout for the shared header and footer. Server-only database initialization lives under src/server/db. Zod connection validation lives under src/server/env. Prisma reads DATABASE_URL through prisma.config.ts. The baseline migration establishes migration history, and test entry points are under tests/unit and tests/e2e.

## Proposed module boundaries

- Keep route handlers, server actions and page components thin. Put feature operations under src/features and keep Prisma queries and role enforcement inside server operations.
- Put the staff dashboard under a protected /admin route group. Validate staff permissions for each protected read and mutation.
- Use published-only projections for public pages and APIs. Keep drafts and previews behind staff authorization. Revalidate affected public routes after publication.
- Add Course and CourseCategory first, with unique slugs and indexed publication/filter fields. Add staff identities and Auth.js records according to the selected provider.
- Add institutional page, faculty, blog, event, testimonial and FAQ entities through additive migrations. Confirm media storage before integrating uploads.
- Add inquiry and application records with optional and required course links respectively. Use transactions for status changes and history once those workflows are approved.

## Course module implementation

src/features/courses owns shared Zod schemas, typed projections, permission rules, database services, UI components and server actions. Public route handlers delegate reads to that service. Staff pages and all mutations check the active staff record against Auth.js sessions. Google sign-in requires verified email and an existing active Staff record. Public pages never query draft courses, and staff preview requires authorization.

The additive 0002_courses migration introduces Course, CourseCategory and Staff with unique slugs and indexed public filters. Fees are Decimal values serialized as strings at server boundaries. Descriptions and curriculum render as text through React escaping. Staff sessions use encrypted JWT cookies and current database authorization.

Public CTA destinations are explicitly marked intake placeholders. The module has no applicant accounts or payments.

## Institutional CMS implementation

The additive 0003_content migration introduces Faculty, BlogPost, BlogCategory, Event, Testimonial, FAQ, InstitutionalContent and MediaAsset without modifying Course data. Content tables share editorial scalar fields, status, order and version checks. Domain details are validated by kind-specific Zod schemas. Blog categories have a restricted foreign-key relationship. Event timestamps are indexed and stored as UTC.

src/features/content owns schema validation, shared server services, public components, editors and server actions. The public institutional route group has shared loading and error boundaries. Staff CMS routes reuse the existing Auth.js staff identities and permissions. src/features/media handles validated filesystem image storage. The public media route checks current content publication or staff permissions on every read and disables response caching.
