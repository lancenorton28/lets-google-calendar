import { Router } from "express";
import { z } from "zod";
import { getAuthenticatedClient } from "./client";
import { mapGoogleEvent, buildGoogleEventRequest } from "./events";
import { handleOAuthCallback, startOAuth } from "./oauth";
import { createEventSchema } from "./schema";
/**
 * Mount the Google Calendar routes. Exposes:
 *
 * - `GET  /api/google/oauth/start`        (auth required)
 * - `GET  /api/google/oauth/callback`
 * - `GET  /api/google/calendars`          (auth required)
 * - `GET  /api/google/events`             (auth required)
 * - `POST /api/google/events`             (auth required)
 */
export function createRouter(opts) {
    const router = Router();
    router.get("/api/google/oauth/start", opts.requireAuth, (req, res) => startOAuth(req, res, {
        config: opts.config,
        scopes: opts.scopes,
        stateStore: opts.stateStore,
        resolveUserId: opts.resolveUserId,
    }));
    router.get("/api/google/oauth/callback", (req, res) => {
        handleOAuthCallback(req, res, {
            config: opts.config,
            scopes: opts.scopes,
            stateStore: opts.stateStore,
            tokenStore: opts.tokenStore,
            successRedirect: opts.successRedirect,
        }).catch((err) => {
            console.error("OAuth callback error:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "OAuth callback failed" });
            }
        });
    });
    router.get("/api/google/calendars", opts.requireAuth, async (req, res) => {
        try {
            const calendar = await getAuthenticatedClient(opts.resolveUserId(req), opts.config, { tokenStore: opts.tokenStore });
            const response = await calendar.calendarList.list();
            const calendars = (response.data.items || []).map((cal) => ({
                id: cal.id,
                name: cal.summary,
                color: cal.backgroundColor,
                primary: cal.primary || false,
            }));
            res.json(calendars);
        }
        catch (error) {
            console.error("Error fetching Google Calendars:", error.message);
            res.status(500).json({ error: "Failed to fetch Google Calendars" });
        }
    });
    router.get("/api/google/events", opts.requireAuth, async (req, res) => {
        try {
            const { timeMin, timeMax, calendarId } = req.query;
            const selectedCalendarId = calendarId || "primary";
            const calendar = await getAuthenticatedClient(opts.resolveUserId(req), opts.config, { tokenStore: opts.tokenStore });
            const response = await calendar.events.list({
                calendarId: selectedCalendarId,
                timeMin: timeMin || new Date().toISOString(),
                timeMax: timeMax,
                singleEvents: true,
                orderBy: "startTime",
                maxResults: 250,
            });
            res.json((response.data.items || []).map((event) => mapGoogleEvent(event, selectedCalendarId)));
        }
        catch (error) {
            console.error("Error fetching Google events:", error.message);
            res.status(500).json({ error: "Failed to fetch Google events" });
        }
    });
    router.post("/api/google/events", opts.requireAuth, async (req, res) => {
        try {
            const parsed = createEventSchema.parse(req.body);
            const calendar = await getAuthenticatedClient(opts.resolveUserId(req), opts.config, { tokenStore: opts.tokenStore });
            const response = await calendar.events.insert({
                calendarId: parsed.calendarId || "primary",
                requestBody: buildGoogleEventRequest(parsed),
            });
            res.status(201).json({
                id: response.data.id,
                title: response.data.summary,
                start: response.data.start?.dateTime || response.data.start?.date,
                end: response.data.end?.dateTime || response.data.end?.date,
                allDay: !!response.data.start?.date,
                location: response.data.location,
                source: "google",
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: "Invalid event data", details: error.errors });
                return;
            }
            console.error("Error creating Google event:", error.message);
            res.status(500).json({ error: "Failed to create Google event" });
        }
    });
    return router;
}
//# sourceMappingURL=routes.js.map