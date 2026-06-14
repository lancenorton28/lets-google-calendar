import { z } from "zod";
/**
 * Canonical event shape for the library. Consumers may also accept richer
 * inputs and convert down to this before calling the library, but the public
 * `POST /api/google/events` route will validate against this schema.
 */
export const createEventSchema = z.object({
    title: z.string().min(1),
    start: z.string(),
    end: z.string(),
    allDay: z.boolean().optional().default(false),
    description: z.string().optional(),
    location: z.string().optional(),
    calendarId: z.string().optional().default("primary"),
});
export const updateEventSchema = z.object({
    title: z.string().min(1).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    allDay: z.boolean().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    calendarId: z.string().optional().default("primary"),
});
//# sourceMappingURL=schema.js.map