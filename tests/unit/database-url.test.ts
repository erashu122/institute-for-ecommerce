import { describe, expect, it } from "vitest";
import { databaseUrl } from "../../src/server/env/database";

describe("DATABASE_URL", () => {
  it("accepts a PostgreSQL connection URL", () => {
    expect(databaseUrl.safeParse("postgresql://localhost:5432/institute_test").success).toBe(true);
  });

  it.each([undefined, "https://localhost", "postgresql://"])("rejects %s", (value) => {
    expect(databaseUrl.safeParse(value).success).toBe(false);
  });
});
