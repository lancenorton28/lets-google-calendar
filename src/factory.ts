import { getAuthenticatedClient, assertConfig, DEFAULT_SCOPES } from "./client";
import { createRouter } from "./routes";
import type { calendar_v3 } from "googleapis";
import type {
  CreateGoogleCalendarOptions,
  GoogleCalendar,
  GoogleCalendarConfig,
  RouterDeps,
} from "./types";

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
export function createGoogleCalendar(
  config: GoogleCalendarConfig,
  deps: RouterDeps,
  options: CreateGoogleCalendarOptions = {},
): GoogleCalendar {
  assertConfig(config);
  const scopes = options.scopes ?? [...DEFAULT_SCOPES];
  const successRedirect = options.successRedirect ?? "/?google=connected";

  return {
    config,
    scopes,
    async client(userId: number): Promise<calendar_v3.Calendar> {
      return getAuthenticatedClient(userId, config, { tokenStore: deps.tokenStore });
    },
    router() {
      return createRouter({ config, scopes, successRedirect, ...deps });
    },
  };
}
