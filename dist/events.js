/** Map a Google Calendar API event into the library's neutral event shape. */
export function mapGoogleEvent(event, calendarId = "primary") {
    return {
        id: event.id ?? "",
        title: event.summary || "(No title)",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        description: event.description || "",
        location: event.location || "",
        source: "google",
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
export function buildGoogleEventRequest(input) {
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
//# sourceMappingURL=events.js.map