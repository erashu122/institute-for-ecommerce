import { z } from "zod";

export const databaseUrl = z.url({
  protocol: /^postgres(ql)?$/,
  hostname: /.+/,
  error: "DATABASE_URL must be a PostgreSQL URL with a hostname.",
});
