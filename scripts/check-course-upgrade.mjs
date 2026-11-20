import pg from "pg";
import { createHash } from "node:crypto";
import { writeFile, readFile } from "node:fs/promises";

if (
  process.env.INSTITUTE_TEST_DATABASE !== "1" ||
  !process.env.UPGRADE_HASH_FILE
)
  throw new Error("Requires the isolated migration test harness.");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
await client.connect();
try {
  if (process.argv[2] === "before") {
    await client.query(
      'INSERT INTO "CourseCategory" (id,name,slug) VALUES ($1,$2,$3)',
      ["upgrade-category", "Upgrade fixture", "upgrade-fixture"],
    );
    await client.query(
      'INSERT INTO "Course" (id,title,slug,summary,description,"categoryId",duration,mode,eligibility,curriculum,outcomes,fee,"updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())',
      [
        "upgrade-course",
        "Preserve this course",
        "upgrade-fixture",
        "Original summary",
        "Original description",
        "upgrade-category",
        "4 weeks",
        "ONLINE",
        "Computer basics",
        ["Original unit"],
        ["Original outcome"],
        "1234.50",
      ],
    );
  }
  const row = await client.query(
    'SELECT row_to_json(c) AS row FROM "Course" c WHERE id=$1',
    ["upgrade-course"],
  );
  const hash = createHash("sha256")
    .update(JSON.stringify(row.rows[0].row))
    .digest("hex");
  if (process.argv[2] === "before")
    await writeFile(process.env.UPGRADE_HASH_FILE, hash);
  else {
    if (hash !== (await readFile(process.env.UPGRADE_HASH_FILE, "utf8")))
      throw new Error("Existing course changed during the CMS migration.");
    console.log("Course row preserved across the Phase 3 migration.");
  }
} finally {
  await client.end();
}
