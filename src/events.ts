import type { calendar_v3 } from "googleapis";
import type { CreateEventInput, UpdateEventInput } from "./schema";

export interface MappedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  source: "google";
  calendarName: string;
  calendarId: string;
}

/** Map a Google Calendar API event into the library's neutral event shape. */
export function mapGoogleEvent(
  event: calendar_v3.Schema$Event,
  calendarId = "primary",
): MappedEvent {
  return {
    id: event.id ?? "",
    title: event.summary || "(No title)",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
    description: event.description || "",
    location: event.location || "",
    source: "google" as const,
    calendarName: "Google Calendar",
    calendarId,
  };
}

/**
 * Build a Google Calendar API `events.insert` / `events.patch` request body
 * from a {@link CreateEventInput} or {@link UpdateEventInput}. Timezone is
 * inferred from the server's Intl locale — pass an explicit `timeZone` on the
 * input if you need to override.
 */
export function buildGoogleEventRequest(input: CreateEventInput | UpdateEventInput) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const allDay = input.allDay ?? false;

  return {
    summary: "title" in input ? input.title : undefined,
    description: input.description,
    location: input.location,
    start: input.start
      ? allDay
        ? { date: input.start.split("T")[0] }
        : { dateTime: input.start, timeZone: tz }
      : undefined,
    end: input.end
      ? allDay
        ? { date: input.end.split("T")[0] }
        : { dateTime: input.end, timeZone: tz }
      : undefined,
  };
}
