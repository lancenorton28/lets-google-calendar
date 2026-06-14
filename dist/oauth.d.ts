import type { Request, Response } from "express";
import type { GoogleCalendarConfig, StateStore, TokenStore } from "./types";
export interface StartOAuthOptions {
    config: GoogleCalendarConfig;
    scopes: string[];
    stateStore: StateStore;
    resolveUserId: (req: Request) => number;
}
/**
 * Generate a CSRF state, persist (state → userId) via the consumer's
 * `stateStore`, then redirect the browser to Google's consent screen.
 *
 * Requires `prompt=consent` so Google issues a refresh_token even on
 * subsequent connections.
 */
export declare function startOAuth(req: Request, res: Response, opts: StartOAuthOptions): void;
export interface HandleOAuthCallbackOptions {
    config: GoogleCalendarConfig;
    scopes: string[];
    stateStore: StateStore;
    tokenStore: TokenStore;
    successRedirect: string;
}
/**
 * Validate the incoming state, exchange the auth code for tokens, persist
 * them via the consumer's `tokenStore`, then redirect to `successRedirect`.
 */
export declare function handleOAuthCallback(req: Request, res: Response, opts: HandleOAuthCallbackOptions): Promise<void>;
//# sourceMappingURL=oauth.d.ts.map