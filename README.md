# @lets/google-calendar

Drop-in Google Calendar OAuth + event CRUD for Express apps. Four injection points, zero coupling to your DB or auth.

## Why

If you've copy-pasted Google Calendar code into a second project and cursed, this is the fix. The library handles the OAuth dance, token refresh, event mapping, and CRUD routes. You wire it to your database, your auth middleware, and your session — that's it.

## Install

```bash
# GitHub install (recommended while private)
npm install github:lancenorton28/lets-google-calendar#v0.1.0

# Or, once published:
npm install @lets/google-calendar
```

Peer deps: `express ^4.18 || ^5`, `zod ^3.22`. The library brings in `googleapis` itself.

## Quick start (30 lines)

```ts
import express from "express";
import session from "express-session";
import { createGoogleCalendar } from "@lets/google-calendar";

const app = express();

app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false }));

// 1. Your auth middleware (session-based, JWT, whatever you use)
const requireAuth: express.RequestHandler = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorised" });
  next();
};

// 2. Resolve a request to the user ID (the library is multi-tenant by userId)
const resolveUserId = (req: express.Request) => Number(req.session.userId);

// 3. Persist OAuth state in the session (CSRF protection for the round-trip)
const stateStore = {
  set: (req, state, userId) => { req.session.googleOAuthState = state; req.session.googleOAuthUserId = userId; },
  get: (req, state) => (req.session.googleOAuthState === state ? req.session.googleOAuthUserId : null),
  delete: (req) => { delete req.session.googleOAuthState; delete req.session.googleOAuthUserId; },
};

// 4. Persist OAuth tokens somewhere durable — DB, KV, secrets manager
const tokenStore = {
  async get(userId) { /* return { accessToken, refreshToken, expiry, scope } or null */ },
  async upsert({ userId, accessToken, refreshToken, expiry, scope }) { /* write it */ },
};

const calendar = createGoogleCalendar(
  {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: "https://myapp.com/api/google/oauth/callback",
  },
  { requireAuth, resolveUserId, stateStore, tokenStore },
);

app.use(calendar.router());
app.listen(3000);
```

## The four injection points

Every consumer must provide all four. They are the only customisation needed.

| Dep | Purpose | Typical implementation |
|---|---|---|
| `requireAuth` | Express middleware that gates the protected routes. | Your existing session/JWT/etc. middleware. |
| `resolveUserId` | Reads a request, returns the user ID that owns the Google connection. | `req => req.session.userId` or `req => req.user.id` (JWT). |
| `stateStore` | Persists the OAuth `state` token between the start and callback requests. | Most apps use `req.session`. Anything keyed by request works. |
| `tokenStore` | Persists `accessToken`, `refreshToken`, `expiry`, `scope` keyed by user ID. | Postgres, Redis, Firestore, encrypted file — whatever you already use. |

The library handles token refresh internally. When Google rotates the access token, the new pair is upserted via your `tokenStore`.

## Routes exposed

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/google/oauth/start` | yes | Begin the OAuth flow. Redirects to Google. |
| `GET` | `/api/google/oauth/callback` | no | Handle Google's redirect. Stores tokens, redirects to `successRedirect`. |
| `GET` | `/api/google/calendars` | yes | List the user's Google calendars. |
| `GET` | `/api/google/events?timeMin=&timeMax=&calendarId=` | yes | List events in a window. |
| `POST` | `/api/google/events` | yes | Create an event. Body validated by `createEventSchema`. |

## Programmatic API

If you need to call the Google Calendar API directly (e.g. from a background job or a custom route):

```ts
const client = await calendar.client(userId);
const events = await client.events.list({ calendarId: "primary", maxResults: 50 });
```

The returned client is a standard `googleapis` `calendar_v3.Calendar` instance. It transparently refreshes expired access tokens and persists the new pair via your `tokenStore`.

## Schemas

Two zod schemas are exported for convenience:

```ts
import { createEventSchema, updateEventSchema } from "@lets/google-calendar";

type CreateEventInput = z.infer<typeof createEventSchema>;
// { title, start, end, allDay?, description?, location?, calendarId? }
```

Consumers may also accept richer inputs and convert down to these before calling the library.

## Mapped event shape

Events returned by `GET /api/google/events` (or `mapGoogleEvent()`) are:

```ts
{
  id: string;
  title: string;
  start: string;       // ISO dateTime or YYYY-MM-DD for all-day
  end: string;
  description: string;
  location: string;
  source: "google";
  calendarName: "Google Calendar";
  calendarId: string;
}
```

## Configuration

```ts
createGoogleCalendar(config, deps, {
  scopes?: string[];          // default: read-only + events
  successRedirect?: string;   // default: "/?google=connected"
});
```

Override `scopes` if you need different access (e.g. read-only, or `calendar.settings.readonly`).

## Testing your setup

1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Google Cloud Console for your project.
2. Add `redirectUri` to the OAuth client's authorised redirect URIs.
3. Hit `GET /api/google/oauth/start` in a logged-in browser session — you'll be redirected to Google's consent screen.
4. Approve. Google redirects back to `/api/google/oauth/callback`, which stores the tokens and redirects to `successRedirect`.
5. Hit `GET /api/google/calendars` — should return your calendar list.

## License

MIT.
