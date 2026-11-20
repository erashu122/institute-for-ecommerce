import { expect, it } from "vitest";
import {
  eventInputValue,
  eventInputToIso,
} from "../../src/features/content/events";
it("round-trips event inputs using the institute timezone", () => {
  expect(eventInputValue("2030-01-01T04:30:00Z")).toBe("2030-01-01T10:00:00");
  expect(new Date(eventInputToIso("2030-01-01T10:00")).toISOString()).toBe(
    "2030-01-01T04:30:00.000Z",
  );
  expect(eventInputToIso("")).toBe("");
  expect(() => eventInputToIso("not-a-date")).toThrow();
});
