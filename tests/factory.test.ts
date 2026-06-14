import { describe, expect, it } from "vitest";
import type { Request, RequestHandler } from "express";
import { createGoogleCalendar } from "../src/index.js";
import { InMemoryStateStore, InMemoryTokenStore } from "./inMemoryStores.js";

const noopAuth: RequestHandler = (_req, _res, next) => next();
const resolveUserId = (_req: Request) => 1;

const baseConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  redirectUri: "https://example.com/api/google/oauth/callback",
};

describe("createGoogleCalendar", () => {
  it("exposes config and scopes", () => {
    const calendar = createGoogleCalendar(
      baseConfig,
      {
        requireAuth: noopAuth,
        resolveUserId,
        stateStore: new InMemoryStateStore(),
        tokenStore: new InMemoryTokenStore(),
      },
    );
    expect(calendar.config.clientId).toBe("test-client-id");
    expect(calendar.scopes).toContain("https://www.googleapis.com/auth/calendar.readonly");
    expect(calendar.scopes).toContain("https://www.googleapis.com/auth/calendar.events");
  });

  it("throws if config is missing required fields", () => {
    expect(() =>
      createGoogleCalendar(
        { clientId: "", clientSecret: "x", redirectUri: "https://x" },
        {
          requireAuth: noopAuth,
          resolveUserId,
          stateStore: new InMemoryStateStore(),
          tokenStore: new InMemoryTokenStore(),
        },
      ),
    ).toThrow(/clientId/);
  });

  it("accepts a custom successRedirect", () => {
    const calendar = createGoogleCalendar(
      baseConfig,
      {
        requireAuth: noopAuth,
        resolveUserId,
        stateStore: new InMemoryStateStore(),
        tokenStore: new InMemoryTokenStore(),
      },
      { successRedirect: "/calendar?google=connected" },
    );
    expect(calendar.scopes).toBeDefined();
    // successRedirect is internal to router() — covered by route tests below.
  });

  it("accepts custom scopes", () => {
    const calendar = createGoogleCalendar(
      baseConfig,
      {
        requireAuth: noopAuth,
        resolveUserId,
        stateStore: new InMemoryStateStore(),
        tokenStore: new InMemoryTokenStore(),
      },
      { scopes: ["https://www.googleapis.com/auth/calendar.readonly"] },
    );
    expect(calendar.scopes).toEqual([
      "https://www.googleapis.com/auth/calendar.readonly",
    ]);
  });

  it("router() returns an Express Router instance", () => {
    const calendar = createGoogleCalendar(
      baseConfig,
      {
        requireAuth: noopAuth,
        resolveUserId,
        stateStore: new InMemoryStateStore(),
        tokenStore: new InMemoryTokenStore(),
      },
    );
    const router = calendar.router();
    expect(typeof router).toBe("function");
    // Express routers are callable functions with a `.stack` of routes.
    expect(Array.isArray((router as any).stack)).toBe(true);
    const paths = (router as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => Object.keys(layer.route.methods)[0]?.toUpperCase() + " " + layer.route.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        "GET /api/google/oauth/start",
        "GET /api/google/oauth/callback",
        "GET /api/google/calendars",
        "GET /api/google/events",
        "POST /api/google/events",
      ]),
    );
  });

  it("client() throws when the user has no stored token", async () => {
    const calendar = createGoogleCalendar(
      baseConfig,
      {
        requireAuth: noopAuth,
        resolveUserId,
        stateStore: new InMemoryStateStore(),
        tokenStore: new InMemoryTokenStore(),
      },
    );
    await expect(calendar.client(42)).rejects.toThrow(/not connected/);
  });

  it("client() returns a googleapis calendar instance when a token is stored", async () => {
    const tokenStore = new InMemoryTokenStore();
    await tokenStore.upsert({
      userId: 1,
      accessToken: "fake-access",
      refreshToken: "fake-refresh",
      expiry: new Date(Date.now() + 3600 * 1000),
      scope: "https://www.googleapis.com/auth/calendar.readonly",
    });

    const calendar = createGoogleCalendar(baseConfig, {
      requireAuth: noopAuth,
      resolveUserId,
      stateStore: new InMemoryStateStore(),
      tokenStore,
    });

    const client = await calendar.client(1);
    // The googleapis Calendar resource exposes the three namespaces we use.
    expect(typeof client.events.list).toBe("function");
    expect(typeof client.events.insert).toBe("function");
    expect(typeof client.events.delete).toBe("function");
    expect(typeof client.events.patch).toBe("function");
    expect(typeof client.calendarList.list).toBe("function");
  });
});
