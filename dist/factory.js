import { getAuthenticatedClient, assertConfig, DEFAULT_SCOPES } from "./client";
import { createRouter } from "./routes";
/**
 * Build a configured Google Calendar integration.
 *
 * @param config  Google OAuth client configuration.
 * @param deps    The four injection points: requireAuth, resolveUserId, stateStore, tokenStore.
 * @param options Optional overrides for scopes and the OAuth success redirect.
 *
 * @example
 * ```ts
 * import { createGoogleCalendar } from "@lets/google-calendar";
 *
 * const calendar = createGoogleCalendar(
 *   {
 *     clientId: process.env.GOOGLE_CLIENT_ID!,
 *     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 *     redirectUri: "https://myapp.com/api/google/oauth/callback",
 *   },
 *   { requireAuth, resolveUserId, stateStore, tokenStore },
 *   { successRedirect: "/calendar?google=connected" },
 * );
 *
 * app.use(calendar.router());
 * const client = await calendar.client(userId);
 * ```
 */
export function createGoogleCalendar(config, deps, options = {}) {
    assertConfig(config);
    const scopes = options.scopes ?? [...DEFAULT_SCOPES];
    const successRedirect = options.successRedirect ?? "/?google=connected";
    return {
        config,
        scopes,
        async client(userId) {
            return getAuthenticatedClient(userId, config, { tokenStore: deps.tokenStore });
        },
        router() {
            return createRouter({ config, scopes, successRedirect, ...deps });
        },
    };
}
//# sourceMappingURL=factory.js.map