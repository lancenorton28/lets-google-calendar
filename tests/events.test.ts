import { describe, expect, it } from "vitest";
import { buildGoogleEventRequest, mapGoogleEvent } from "../src/index.js";

describe("mapGoogleEvent", () => {
  it("maps a dateTime event", () => {
    const result = mapGoogleEvent({
      id: "evt-1",
      summary: "Sync",
      start: { dateTime: "2026-06-15T09:00:00Z" },
      end: { dateTime: "2026-06-15T09:30:00Z" },
    });
    expect(result).toMatchObject({
      id: "evt-1",
      title: "Sync",
      start: "2026-06-15T09:00:00Z",
      end: "2026-06-15T09:30:00Z",
      source: "google",
      calendarName: "Google Calendar",
      calendarId: "primary",
    });
  });

  it("maps an all-day event", () => {
    const result = mapGoogleEvent({
      id: "evt-2",
      summary: "Holiday",
      start: { date: "2026-12-25" },
      end: { date: "2026-12-26" },
    });
    expect(result.start).toBe("2026-12-25");
    expect(result.end).toBe("2026-12-26");
  });

  it("uses a placeholder title when missing", () => {
    const result = mapGoogleEvent({ id: "evt-3", start: { dateTime: "2026-06-15T09:00:00Z" }, end: { dateTime: "2026-06-15T09:30:00Z" } });
    expect(result.title).toBe("(No title)");
  });

  it("defaults calendarId to primary", () => {
    const result = mapGoogleEvent({ id: "evt-4" });
    expect(result.calendarId).toBe("primary");
  });

  it("honours an explicit calendarId", () => {
    const result = mapGoogleEvent({ id: "evt-5" }, "work");
    expect(result.calendarId).toBe("work");
  });
});

describe("buildGoogleEventRequest", () => {
  it("builds a timed event request", () => {
    const result = buildGoogleEventRequest({
      title: "Standup",
      start: "2026-06-15T09:00:00Z",
      end: "2026-06-15T09:30:00Z",
      allDay: false,
    });
    expect(result.summary).toBe("Standup");
    expect(result.start).toEqual({ dateTime: "2026-06-15T09:00:00Z", timeZone: expect.any(String) });
    expect(result.end).toEqual({ dateTime: "2026-06-15T09:30:00Z", timeZone: expect.any(String) });
  });

  it("builds an all-day event request", () => {
    const result = buildGoogleEventRequest({
      title: "Holiday",
      start: "2026-12-25T00:00:00Z",
      end: "2026-12-26T00:00:00Z",
      allDay: true,
    });
    expect(result.start).toEqual({ date: "2026-12-25" });
    expect(result.end).toEqual({ date: "2026-12-26" });
  });

  it("drops title on update payloads (UpdateEventInput has it optional)", () => {
    const result = buildGoogleEventRequest({
      start: "2026-06-15T10:00:00Z",
      end: "2026-06-15T11:00:00Z",
    });
    expect(result.summary).toBeUndefined();
  });
});
