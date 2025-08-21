export async function flushOps(ops: any[]) {
    return fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops }),
        keepalive: true, // survives pagehide
    }).then(r => r.json());
}

export function beaconFlush(ops: any[]) {
    try {
        const blob = new Blob([JSON.stringify({ ops })], { type: "application/json" });
        navigator.sendBeacon?.("/api/roadmap", blob);
    } catch {}
}
