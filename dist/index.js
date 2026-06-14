/**
 * @lets/google-calendar
 *
 * Drop-in Google Calendar OAuth + event CRUD for Express apps.
 * Four injection points, zero coupling to your DB or auth.
 *
 * @example
 * ```ts
 * import { createGoogleCalendar } from "@lets/google-calendar";
 *
 * const calendar = createGoogleCalendar(
 *   { clientId, clientSecret, redirectUri },
 *   { requireAuth, resolveUserId, stateStore, tokenStore },
 * );
 *
 * app.use(calendar.router());
 * ```
 */
export { createGoogleCalendar } from "./factory";
export { createEventSchema, updateEventSchema } from "./schema";
export { mapGoogleEvent, buildGoogleEventRequest } from "./events";
//# sourceMappingURL=index.js.map