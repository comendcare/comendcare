"use client";
import * as React from "react";
import {FeedCard} from "~web/components/feed/feed-card-registry";
import type {FeedItemDTO, FeedPageDTO} from "@comend/lib/types";
import { Button } from "@comend/components/ui/button";


function useInfiniteFeed(opts: { orgId?: string; initialPage?: FeedPageDTO }) {
    const { orgId, initialPage } = opts;
    const [pages, setPages] = React.useState<FeedPageDTO[]>(initialPage ? [initialPage] : []);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const nextCursor = pages.at(-1)?.nextCursor ?? null;


    const loadMore = React.useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (orgId) params.set("orgId", orgId);
            if (nextCursor) {
                params.set("cursorCreatedAt", nextCursor.createdAt);
                params.set("cursorId", nextCursor.id);
            }
            const res = await fetch(`/api/feed?${params.toString()}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed: ${res.status}`);
            const page: FeedPageDTO = await res.json();
            setPages((prev) => [...prev, page]);
        } catch (e: any) {
            setError(e.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [orgId, nextCursor, loading]);
// IntersectionObserver to auto-load when sentinel visible
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;
        const io = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && pages.at(-1)?.nextCursor) {
                loadMore();
            }
        }, { rootMargin: "800px" });
        io.observe(el);
        return () => io.disconnect();
    }, [loadMore, pages]);


    const items: FeedItemDTO[] = React.useMemo(() => pages.flatMap((p) => p.items), [pages]);


    return { items, loadMore, loading, error, hasMore: Boolean(pages.at(-1)?.nextCursor), sentinelRef } as const;
}


export function FeedList({ orgId, initialPage }: { orgId?: string; initialPage?: FeedPageDTO }) {
    const { items, hasMore, loading, error, sentinelRef, loadMore } = useInfiniteFeed({ orgId, initialPage });


    return (
        <div className="flex flex-col gap-3 w-full">
            {items.map((item) => (
                <FeedCard key={`${item.id}`} item={item} />
            ))}


            {/* status row */}
            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}
            {loading && (
                <div className="text-sm text-muted-foreground">Loading…</div>
            )}


            {/* sentinel for auto-load */}
            <div ref={sentinelRef} />


            {/* explicit load more for accessibility / fallback */}
            {!loading && hasMore && (
                <div className="flex justify-center">
                    <Button variant="outline" onClick={loadMore}>Load more</Button>
                </div>
            )}


            {!hasMore && (
                <div className="text-center text-xs text-muted-foreground py-4">
                    {`You’re all caught up`}
                </div>
            )}
        </div>
    );
}
