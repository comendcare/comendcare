"use client";
import { useEffect, useRef } from "react";
import { useWriteQueue } from "~web/state/writeQueue";
import { flushOps } from "~web/lib/flushOps";

export function useDrainWriteQueue() {
    const draining = useRef(false);
    const { pending, removeMany, bumpTriesMany } = useWriteQueue();

    useEffect(() => {
        if (draining.current || pending.length === 0) return;
        draining.current = true;

        (async () => {
            const res = await flushOps(pending);
            // server returns { succeeded: string[], failed: string[] }
            if (res?.succeeded) removeMany(res.succeeded);
            if (res?.failed) bumpTriesMany(res.failed);
            draining.current = false;
        })().catch(() => {
            bumpTriesMany(pending.map(p => p.idempotencyKey));
            draining.current = false;
        });
    }, [pending, removeMany, bumpTriesMany]);

    return null;
}
