import "dotenv/config";
import pg from "pg";

if (
  process.env.NODE_ENV === "production" ||
  !(
    process.env.INSTITUTE_TEST_DATABASE === "1" ||
    process.argv.includes("--development")
  )
) {
  throw new Error(
    "Use --development to explicitly seed synthetic CMS content in a development database.",
  );
}
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
await db.connect();
try {
  await db.query("BEGIN");
  const entries = [
    [
      "Faculty",
      "sample-mentor",
      "Sample Faculty Profile",
      {
        position: "Ecommerce mentor",
        qualifications: "Synthetic development profile",
      },
    ],
    ["BlogCategory", "sample-retail", "Retail insights", {}],
    [
      "BlogPost",
      "sample-store-planning",
      "Planning a sample store",
      { author: "Development author" },
    ],
    [
      "Event",
      "sample-workshop",
      "Sample ecommerce workshop",
      {
        startsAt: "2030-06-10T10:00:00+05:30",
        endsAt: "2030-06-10T12:00:00+05:30",
        location: "Sample classroom",
      },
    ],
    [
      "Testimonial",
      "sample-testimonial",
      "Sample learner",
      { personRole: "Synthetic development testimonial" },
    ],
    [
      "InstitutionalContent",
      "about",
      "About the institute",
      {
        mission: "Synthetic mission for development.",
        vision: "Synthetic vision for development.",
        leadership: "Synthetic leadership profile for development.",
      },
    ],
  ];
  for (const [table, slug, title, details] of entries) {
    const event = table === "Event";
    await db.query(
      'INSERT INTO "' +
        table +
        '" (id,slug,title,summary,body,details,status,"updatedAt"' +
        (event ? ',"startsAt","endsAt"' : "") +
        ") VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,NOW()" +
        (event ? ",$8,$9" : "") +
        ") ON CONFLICT (slug) DO NOTHING",
      [
        "cms-seed-" + slug,
        slug,
        title,
        "Synthetic development content.",
        "This is sample content for local development. Replace it with institute-approved copy before launch.",
        JSON.stringify(details),
        "PUBLISHED",
        ...(event ? [details.startsAt, details.endsAt] : []),
      ],
    );
  }
  const category = await db.query(
    'SELECT id FROM "BlogCategory" WHERE slug=$1',
    ["sample-retail"],
  );
  await db.query(
    'UPDATE "BlogPost" SET "categoryId"=$1 WHERE id=$2 AND "categoryId" IS NULL',
    [category.rows[0].id, "cms-seed-sample-store-planning"],
  );
  for (let index = 1; index <= 10; index++) {
    await db.query(
      'INSERT INTO "FAQ" (id,slug,title,body,status,"sortOrder","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT (slug) DO NOTHING',
      [
        "cms-faq-" + index,
        "sample-faq-" + index,
        "Sample question " + index,
        "Sample answer for development.",
        "PUBLISHED",
        index,
      ],
    );
  }
  await db.query("COMMIT");
  console.log("Synthetic CMS seed completed. Existing slugs were preserved.");
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  await db.end();
}
