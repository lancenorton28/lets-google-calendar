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
export declare function mapGoogleEvent(event: calendar_v3.Schema$Event, calendarId?: string): MappedEvent;
/**
 * Build a Google Calendar API `events.insert` / `events.patch` request body
 * from a {@link CreateEventInput} or {@link UpdateEventInput}. Timezone is
 * inferred from the server's Intl locale — pass an explicit `timeZone` on the
 * input if you need to override.
 */
export declare function buildGoogleEventRequest(input: CreateEventInput | UpdateEventInput): {
    summary: string | undefined;
    description: string | undefined;
    location: string | undefined;
    start: {
        date: string | undefined;
        dateTime?: undefined;
        timeZone?: undefined;
    } | {
        dateTime: string;
        timeZone: string;
        date?: undefined;
    } | undefined;
    end: {
        date: string | undefined;
        dateTime?: undefined;
        timeZone?: undefined;
    } | {
        dateTime: string;
        timeZone: string;
        date?: undefined;
    } | undefined;
};
//# sourceMappingURL=events.d.ts.map