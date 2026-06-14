import type { Request, RequestHandler, Router } from "express";
import type { calendar_v3 } from "googleapis";

/**
 * Google OAuth client configuration. The `redirectUri` must match a URL
 * registered in the Google Cloud Console for the OAuth client.
 */
export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/** Persisted credentials. The library treats this as opaque apart from the four fields. */
export interface StoredGoogleToken {
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
}

export interface TokenUpsertInput {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  scope: string;
}

/**
 * The four token operations the library needs. Consumers wire this to their
 * own database / KV / secret store. Async-first because most stores are.
 */
export interface TokenStore {
  get(userId: number): Promise<StoredGoogleToken | null>;
  upsert(input: TokenUpsertInput): Promise<StoredGoogleToken>;
}

/**
 * State-store for the OAuth round-trip. The library uses a CSRF-style `state`
 * parameter; the consumer decides where it lives. Most apps will use
 * `req.session`, but anything that can persist a state → userId mapping works.
 *
 * The library calls these during the request lifecycle, so the request is
 * always passed in. This lets the consumer reach into `req.session` (or
 * anywhere else keyed by request) without the library needing to know.
 */
export interface StateStore {
  set(req: Request, state: string, userId: number): Promise<void> | void;
  get(req: Request, state: string): Promise<number | null> | number | null;
  delete(req: Request, state: string): Promise<void> | void;
}

/** Resolve a request to the user ID that owns the Google Calendar connection. */
export type ResolveUserId = (req: Request) => number;

/**
 * The four injection points. Every consumer must provide all of them. Pass
 * to {@link createGoogleCalendar} as the second argument.
 */
export interface RouterDeps {
  /** Express middleware that gates the protected routes (e.g. `/api/google/calendars`). */
  requireAuth: RequestHandler;
  /** Resolves a request to the user ID that should own the OAuth connection / calendar calls. */
  resolveUserId: ResolveUserId;
  /** Persists the OAuth `state` token between the start and callback requests. */
  stateStore: StateStore;
  /** Persists the OAuth tokens (`access_token`, `refresh_token`, etc.) keyed by user ID. */
  tokenStore: TokenStore;
}

export interface CreateGoogleCalendarOptions {
  /** Override the default OAuth scopes. Defaults to read-only + events. */
  scopes?: string[];
  /** Where to redirect after a successful OAuth callback. Defaults to `/?google=connected`. */
  successRedirect?: string;
}

/**
 * A configured Google Calendar integration. Holds the OAuth config and the
 * four injection points. The methods are the public surface.
 */
export interface GoogleCalendar {
  readonly config: GoogleCalendarConfig;
  readonly scopes: string[];
  /**
   * Returns an authenticated `googleapis` calendar client for the given user.
   * Throws `Error("Google Calendar not connected")` if the user has no stored tokens.
   *
   * The returned client transparently refreshes expired access tokens and
   * persists the new tokens via the configured `tokenStore`.
   */
  client(userId: number): Promise<calendar_v3.Calendar>;
  /**
   * Returns an Express Router exposing the standard routes:
   * - `GET  /api/google/oauth/start`        (auth required)
   * - `GET  /api/google/oauth/callback`
   * - `GET  /api/google/calendars`          (auth required)
   * - `GET  /api/google/events`             (auth required)
   * - `POST /api/google/events`             (auth required)
   *
   * Mount with `app.use(calendar.router())`.
   */
  router(): Router;
}
