import { describe, expect, it } from "vitest";
import { createEventSchema, updateEventSchema } from "../src/index.js";

describe("createEventSchema", () => {
  it("parses a minimal valid event", () => {
    const result = createEventSchema.parse({
      title: "Standup",
      start: "2026-06-15T09:00:00Z",
      end: "2026-06-15T09:30:00Z",
    });
    expect(result.title).toBe("Standup");
    expect(result.allDay).toBe(false);
    expect(result.calendarId).toBe("primary");
  });

  it("rejects empty title", () => {
    expect(() =>
      createEventSchema.parse({
        title: "",
        start: "2026-06-15T09:00:00Z",
        end: "2026-06-15T09:30:00Z",
      }),
    ).toThrow();
  });

  it("accepts optional description and location", () => {
    const result = createEventSchema.parse({
      title: "Lunch",
      start: "2026-06-15T12:00:00Z",
      end: "2026-06-15T13:00:00Z",
      description: "With the team",
      location: "The cafe",
    });
    expect(result.description).toBe("With the team");
    expect(result.location).toBe("The cafe");
  });
});

describe("updateEventSchema", () => {
  it("accepts partial updates", () => {
    const result = updateEventSchema.parse({ title: "Renamed" });
    expect(result.title).toBe("Renamed");
  });

  it("rejects empty title when provided", () => {
    expect(() => updateEventSchema.parse({ title: "" })).toThrow();
  });
});
