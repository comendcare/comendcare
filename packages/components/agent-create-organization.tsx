// ~web/components/agent-create-organization.tsx
"use client";

import React, {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@comend/components/ui/button";
import {Input} from "@comend/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {toast} from "sonner";
import LoadingDots from "@comend/components/icons/loading-dots";

type AgentCreateOrganizationResponse =
    | {
    id: string;
    success: true;
    organizationId: string;
    subdomain: string;
    name: string;
}
    | {
    success: false;
    error: string;
};

function isLikelyHttpUrl(s: string) {
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

export default function AgentCreateOrganization() {
    const router = useRouter();

    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const disabled = useMemo(() => {
        const t = url.trim();
        return loading || !t || !isLikelyHttpUrl(t);
    }, [url, loading]);

    async function onCreate() {
        const inputUrl = url.trim();
        if (!isLikelyHttpUrl(inputUrl)) {
            toast.error("Please enter a valid http(s) URL.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/agent-create-organization", {
                method: "POST",
                headers: {"content-type": "application/json"},
                body: JSON.stringify({url: inputUrl}),
            });

            const data = (await res.json()) as AgentCreateOrganizationResponse;

            if (!res.ok || !data || data.success === false) {
                toast.error(data?.success === false ? data.error : "Failed to create organization.");
                return;
            }

            toast.success(`Created ${data.name}`);
            // Send them to dashboard by default (matches your existing flow)
            // router.refresh();
            // router.push("/app/dashboard");
            window.location.href = `/api/switch-org/${data.id}?next=/app/profile`;
        } catch (e: any) {
            toast.error(e?.message || "Failed to create organization.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">
                Create profile with AI
            </h2>
            <p className="text-sm text-muted-foreground">
                Paste a patient advocacy group (PAG) website. We’ll extract org details + research plans and create your
                org.
            </p>

            <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.org"
                aria-label="Organization website"
            />
            <Button type="button" variant="cta" disabled={disabled} onClick={onCreate}>
                {loading ? (
                    <div className="w-[88px] flex justify-center items-center">
                        <LoadingDots/>
                    </div>
                ) : (
                    "Auto-create"
                )}
            </Button>

            {!isLikelyHttpUrl(url.trim()) && url.trim().length > 0 && (
                <p className="text-xs text-muted-foreground">Enter a valid URL starting with http:// or https://</p>
            )}
        </section>
    );
}
