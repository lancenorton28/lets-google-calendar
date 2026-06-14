import { Router } from "express";
import type { GoogleCalendarConfig, RouterDeps } from "./types";
export interface CreateRouterOptions extends RouterDeps {
    config: GoogleCalendarConfig;
    scopes: string[];
    successRedirect: string;
}
/**
 * Mount the Google Calendar routes. Exposes:
 *
 * - `GET  /api/google/oauth/start`        (auth required)
 * - `GET  /api/google/oauth/callback`
 * - `GET  /api/google/calendars`          (auth required)
 * - `GET  /api/google/events`             (auth required)
 * - `POST /api/google/events`             (auth required)
 */
export declare function createRouter(opts: CreateRouterOptions): Router;
//# sourceMappingURL=routes.d.ts.map