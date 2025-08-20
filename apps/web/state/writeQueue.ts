"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type OpKind =
    | "UPDATE_MILESTONES"
    | "UPDATE_EDGES"
    | "UPDATE_FLOW"
    | "CREATE_NODES"
    | "DELETE_NODE"
    | "UPDATE_ROADMAP";

export type Op = {
    kind: OpKind;
    idempotencyKey: string;
    payload: any;        // keep small; send only what server needs
    tries: number;
    createdAt: number;
};

type WriteQueueState = {
    pending: Op[];
    enqueue: (op: Omit<Op, "idempotencyKey" | "tries" | "createdAt"> & { idempotencyKey?: string }) => string;
    removeMany: (keys: string[]) => void;
    bumpTriesMany: (keys: string[]) => void;
};

export const useWriteQueue = create<WriteQueueState>()(
    persist(
        (set, get) => ({
            pending: [],
            enqueue: ({ kind, payload, idempotencyKey }) => {
                const key = idempotencyKey ?? nanoid();
                set(s => ({ pending: [...s.pending, { kind, payload, idempotencyKey: key, tries: 0, createdAt: Date.now() }] }));
                return key;
            },
            removeMany: (keys) => set(s => ({ pending: s.pending.filter(o => !keys.includes(o.idempotencyKey)) })),
            bumpTriesMany: (keys) =>
                set(s => ({ pending: s.pending.map(o => (keys.includes(o.idempotencyKey) ? { ...o, tries: o.tries + 1 } : o)) })),
        }),
        { name: "comend-write-queue-v1" }
    )
);
