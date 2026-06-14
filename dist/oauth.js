import { createOAuthClient } from "./client";
/**
 * Generate a CSRF state, persist (state → userId) via the consumer's
 * `stateStore`, then redirect the browser to Google's consent screen.
 *
 * Requires `prompt=consent` so Google issues a refresh_token even on
 * subsequent connections.
 */
export function startOAuth(req, res, opts) {
    const oauth2Client = createOAuthClient(opts.config);
    const state = crypto.randomUUID();
    const userId = opts.resolveUserId(req);
    opts.stateStore.set(req, state, userId);
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: opts.scopes,
        state,
    });
    res.redirect(url);
}
/**
 * Validate the incoming state, exchange the auth code for tokens, persist
 * them via the consumer's `tokenStore`, then redirect to `successRedirect`.
 */
export async function handleOAuthCallback(req, res, opts) {
    const { code, state } = req.query;
    if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Missing OAuth code" });
        return;
    }
    if (!state || typeof state !== "string") {
        res.status(400).json({ error: "Missing OAuth state" });
        return;
    }
    const expectedUserId = await opts.stateStore.get(req, state);
    if (expectedUserId === null || expectedUserId === undefined) {
        res.status(400).json({ error: "Invalid OAuth state" });
        return;
    }
    const oauth2Client = createOAuthClient(opts.config);
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
        res.status(400).json({
            error: "Google did not return a refresh token. Reconnect with consent prompt.",
        });
        return;
    }
    await opts.tokenStore.upsert({
        userId: expectedUserId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
        scope: tokens.scope ?? opts.scopes.join(" "),
    });
    await opts.stateStore.delete(req, state);
    res.redirect(opts.successRedirect);
}
//# sourceMappingURL=oauth.js.map