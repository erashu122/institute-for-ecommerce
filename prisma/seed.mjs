import "dotenv/config";
import pg from "pg";

if (process.env.NODE_ENV === "production") throw new Error("Development seed is disabled in production.");
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL for the dedicated development database.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query('INSERT INTO "CourseCategory" (id,name,slug) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ["seed-retail", "Online retail", "online-retail"]);
  await client.query('INSERT INTO "CourseCategory" (id,name,slug) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', ["seed-marketing", "Digital marketing", "digital-marketing"]);
  const category = await client.query('SELECT id FROM "CourseCategory" WHERE slug=$1', ["online-retail"]);
  const marketing = await client.query('SELECT id FROM "CourseCategory" WHERE slug=$1', ["digital-marketing"]);
  const titles = ["Ecommerce Foundations", "Storefront Operations", "Marketplace Essentials", "Retail Analytics", "Order Fulfillment", "Customer Experience", "Digital Marketing Basics", "Campaign Planning"];
  for (const [index, title] of titles.entries()) {
    const slug = title.toLowerCase().replaceAll(" ", "-");
    await client.query(
      'INSERT INTO "Course" (id,title,slug,summary,description,"categoryId",duration,mode,eligibility,curriculum,outcomes,fee,status,"updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW()) ON CONFLICT (slug) DO NOTHING',
      ["seed-" + slug, title, slug, "Sample course for development and workflow verification.", "Synthetic development content. Replace with approved institute copy before publication.", index < 6 ? category.rows[0].id : marketing.rows[0].id, "6 weeks", index % 2 ? "CLASSROOM" : "ONLINE", "Basic computer skills", ["Retail fundamentals", "Practical exercises"], ["Understand core concepts", "Apply the concepts to a sample store"], "12000.00", index === 7 ? "DRAFT" : "PUBLISHED"],
    );
  }
  await client.query("COMMIT");
  console.log("Synthetic course seed completed. Existing course slugs were preserved.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally { await client.end(); }
