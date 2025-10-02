"use client";

import {useEffect} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export function useLoadingTimeout(delayMs: number = 5000) {
    const router = useRouter()

    useEffect(() => {
        const t = setTimeout(() => {
            toast.warning("Still loading…",
                {
                    description: <p className="inline-flex">
                        If this takes too long, try&nbsp;
                        <div className="underline" onClick={() => router.refresh()}>
                            refreshing the page.
                        </div>
                    </p>,
                }
            );
        }, delayMs);

        return () => clearTimeout(t);
    }, [router, delayMs]);
}
