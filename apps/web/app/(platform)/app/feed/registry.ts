import { z } from "zod";
import {CanonicalFeed} from "@/packages/lib/types";

export type RawMapper = (raw: {
    provider: string;    // e.g. "rss:fda:medwatch"
    eventType: string;   // e.g. "rss_item"
    occurredAt: Date;
    payload: unknown;    // raw JSON
}) => Promise<z.infer<typeof CanonicalFeed> | null>;

const registry: Record<string, RawMapper> = {};

/** Key is `${provider}:${eventType}` to keep it simple */
export function register(provider: string, eventType: string, fn: RawMapper) {
    registry[`${provider}:${eventType}`] = fn;
}
export function getMapper(provider: string, eventType: string): RawMapper | null {
    return registry[`${provider}:${eventType}`] ?? null;
}
