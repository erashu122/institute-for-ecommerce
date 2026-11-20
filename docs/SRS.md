# Software requirements specification

## Confirmed requirements

- Use Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Zod, Vitest and Playwright.
- Provide an accessible, responsive and SEO-friendly public site with a homepage, About, courses and course details, faculty, blog and events.
- Provide secure staff authentication and an admin dashboard for course and institutional content management.
- Accept public inquiries and online admission applications. Provide protected staff workflows to manage those records.
- Preserve approved scope boundaries between the course, CMS, and intake phases.

## Proposed requirements and decisions

- Use Auth.js as planned. Confirm the identity provider and staff provisioning before implementing sign-in.
- Use Admin, Editor and Admissions roles. Confirm the permissions and publication rules with the owner.
- Use English content supplied by the institute, canonical course slugs, searchable course listings and published-only public reads.
- Use manual follow-up for inquiries and admission review. Confirm forms, statuses, retention rules and privacy copy before implementing intake.
- Confirm hosting, media storage, launch domain, accessibility targets and operational ownership before the affected phase.

## Phase 2 decisions

The owner selected Google sign-in. Staff identities are provisioned as active database records. Admin can publish, unpublish and delete. Editor can create and edit course content, including published courses. Fees currently use INR. These role and currency choices can be revised before production use.

## Phase 3 scope and implementation choices

The requested CMS includes public About, faculty profiles, blog/categories, event details, testimonials and FAQs, with protected staff create/edit/preview and publication workflows. Uploaded image validation and published-only media access are included.

Implementation choices for review are Markdown for rich content, the institute timezone Asia/Kolkata for event editing, and a private local filesystem for image storage. Staff edits return content to draft, and Admin approves or publishes it. Persistent storage and approved institute copy must be configured before production use.
