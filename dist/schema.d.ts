import { z } from "zod";
/**
 * Canonical event shape for the library. Consumers may also accept richer
 * inputs and convert down to this before calling the library, but the public
 * `POST /api/google/events` route will validate against this schema.
 */
export declare const createEventSchema: z.ZodObject<{
    title: z.ZodString;
    start: z.ZodString;
    end: z.ZodString;
    allDay: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    calendarId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    calendarId: string;
    description?: string | undefined;
    location?: string | undefined;
}, {
    title: string;
    start: string;
    end: string;
    allDay?: boolean | undefined;
    description?: string | undefined;
    location?: string | undefined;
    calendarId?: string | undefined;
}>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export declare const updateEventSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    start: z.ZodOptional<z.ZodString>;
    end: z.ZodOptional<z.ZodString>;
    allDay: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    calendarId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    calendarId: string;
    title?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    allDay?: boolean | undefined;
    description?: string | undefined;
    location?: string | undefined;
}, {
    title?: string | undefined;
    start?: string | undefined;
    end?: string | undefined;
    allDay?: boolean | undefined;
    description?: string | undefined;
    location?: string | undefined;
    calendarId?: string | undefined;
}>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
//# sourceMappingURL=schema.d.ts.map