# Repository guidance

Phase 1 is the recovered foundation. Phase 2 is pending. Follow the scope and exit criteria in [the roadmap](docs/ROADMAP.md).

- Developer 1 owns the public frontend, responsive layouts, accessibility and SEO.
- Developer 2 owns backend services, database schema and migrations, authentication and validation.
- Developer 3 owns the admin dashboard, integrations, QA and CI.
- Review existing code and Git status before editing. Preserve unrelated changes.
- Keep App Router entry points thin and Prisma, authentication and secrets server-side. Use Zod for external input and enforce staff permissions in server operations.
- Use synthetic fixtures. Keep credentials and personal data out of Git and logs.
- Verify affected behavior before marking work complete. Record actual results and blockers.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
