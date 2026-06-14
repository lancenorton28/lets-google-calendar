import { google } from "googleapis";
/**
 * Default OAuth scopes. Read-only calendar listing + full event read/write.
 * Override via {@link CreateGoogleCalendarOptions.scopes} if you need
 * different access (e.g. read-only, or `calendar.settings.readonly`).
 */
export const DEFAULT_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
];
/** Throws if the config is missing required fields. Called from `createGoogleCalendar`. */
export function assertConfig(config) {
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
        throw new Error("GoogleCalendar config is missing required fields: clientId, clientSecret, redirectUri");
    }
}
export function createOAuthClient(config) {
    return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}
/**
 * Returns an authenticated googleapis calendar client for the given user.
 * Throws `Error("Google Calendar not connected")` if no token is stored.
 *
 * Attaches a `tokens` listener that persists refreshed access tokens back
 * to the token store. The refresh happens automatically inside googleapis.
 */
export async function getAuthenticatedClient(userId, config, deps) {
    const stored = await deps.tokenStore.get(userId);
    if (!stored) {
        throw new Error("Google Calendar not connected");
    }
    const oauth2Client = createOAuthClient(config);
    oauth2Client.setCredentials({
        access_token: stored.accessToken,
        refresh_token: stored.refreshToken,
        expiry_date: stored.expiry.getTime(),
        scope: stored.scope,
    });
    oauth2Client.on("tokens", (tokens) => {
        if (!tokens.access_token && !tokens.refresh_token)
            return;
        void deps.tokenStore
            .upsert({
            userId,
            accessToken: tokens.access_token ?? stored.accessToken,
            refreshToken: tokens.refresh_token ?? stored.refreshToken,
            expiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
            scope: tokens.scope ?? stored.scope,
        })
            .catch((error) => {
            console.error("Failed to persist refreshed Google token:", error);
        });
    });
    return google.calendar({ version: "v3", auth: oauth2Client });
}
//# sourceMappingURL=client.js.map