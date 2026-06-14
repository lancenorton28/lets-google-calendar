import type { OAuth2Client } from "google-auth-library";
import type { calendar_v3 } from "googleapis";
import type { GoogleCalendarConfig, TokenStore } from "./types";
/**
 * Default OAuth scopes. Read-only calendar listing + full event read/write.
 * Override via {@link CreateGoogleCalendarOptions.scopes} if you need
 * different access (e.g. read-only, or `calendar.settings.readonly`).
 */
export declare const DEFAULT_SCOPES: readonly string[];
/** Throws if the config is missing required fields. Called from `createGoogleCalendar`. */
export declare function assertConfig(config: GoogleCalendarConfig): void;
export declare function createOAuthClient(config: GoogleCalendarConfig): OAuth2Client;
/**
 * Returns an authenticated googleapis calendar client for the given user.
 * Throws `Error("Google Calendar not connected")` if no token is stored.
 *
 * Attaches a `tokens` listener that persists refreshed access tokens back
 * to the token store. The refresh happens automatically inside googleapis.
 */
export declare function getAuthenticatedClient(userId: number, config: GoogleCalendarConfig, deps: {
    tokenStore: TokenStore;
}): Promise<calendar_v3.Calendar>;
//# sourceMappingURL=client.d.ts.map