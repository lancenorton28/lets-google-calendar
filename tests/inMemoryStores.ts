import type { Request } from "express";
import type {
  StateStore,
  StoredGoogleToken,
  TokenStore,
  TokenUpsertInput,
} from "../src/index.js";

/** In-memory token store for tests. */
export class InMemoryTokenStore implements TokenStore {
  private store = new Map<number, StoredGoogleToken>();

  async get(userId: number): Promise<StoredGoogleToken | null> {
    return this.store.get(userId) ?? null;
  }

  async upsert(input: TokenUpsertInput): Promise<StoredGoogleToken> {
    const stored: StoredGoogleToken = {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiry: input.expiry,
      scope: input.scope,
    };
    this.store.set(input.userId, stored);
    return stored;
  }
}

/** In-memory state store. Keyed by state string, stores userId. */
export class InMemoryStateStore implements StateStore {
  private store = new Map<string, number>();

  async set(_req: Request, state: string, userId: number): Promise<void> {
    this.store.set(state, userId);
  }

  async get(_req: Request, state: string): Promise<number | null> {
    return this.store.get(state) ?? null;
  }

  async delete(_req: Request, state: string): Promise<void> {
    this.store.delete(state);
  }
}
