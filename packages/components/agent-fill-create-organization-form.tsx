// @comend/components/agent-fill-create-organization-form.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@comend/components/ui/input";
import { Button } from "@comend/components/ui/button";
import { toast } from "sonner";
import LoadingDots from "@comend/components/icons/loading-dots";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import type { UseFormReturn } from "react-hook-form";

type UnifiedFormValues = any;

type Props = {
    form: UseFormReturn<UnifiedFormValues>;
};

type AgentFillResponse =
    | {
    success: true;
    values: Partial<{
        // ORG
        name: string;
        description: string;
        website: string;
        contactEmail: string;
        founded: string;
        subdomain: string;
        orgImage: string;
        therapeuticsInDevelopment: { value: string; label: string; description?: string }[];
        therapeuticsOfInterest: { value: string; label: string; description?: string }[];

        // CONDITION
        disorder: { value: string; label: string; description?: string }[];
        associatedConditions: { value: string; label: string; description?: string }[];
        summary: string;
        categories: { value: string; label: string; description?: string }[];
        causal: { value: string; label: string; description?: string }[];
        genes: { value: string; label: string; description?: string }[];
        systems: { value: string; label: string; description?: string }[];
        symptoms: { value: string; label: string; description?: string }[];

        __agent: any;
    }>;
}
    | { success: false; error: string };

function isLikelyHttpUrl(s: string) {
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

export default function AgentFillCreateOrganizationForm({ form }: Props) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const disabled = useMemo(() => {
        const t = url.trim();
        return loading || !t || !isLikelyHttpUrl(t);
    }, [url, loading]);

    async function onFill() {
        const inputUrl = url.trim();
        if (!isLikelyHttpUrl(inputUrl)) {
            toast.error("Please enter a valid http(s) URL.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/agent-fill-create-organization-form", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ url: inputUrl }),
            });

            const data = (await res.json()) as AgentFillResponse;

            if (!res.ok || !data || data.success === false) {
                toast.error(data?.success === false ? data.error : "Failed to fill form.");
                return;
            }

            const v = data.values || {};

            // ORG
            if (typeof v.name === "string") form.setValue("name", v.name, { shouldDirty: true });
            if (typeof v.description === "string") form.setValue("description", v.description, { shouldDirty: true });
            if (typeof v.website === "string") form.setValue("website", v.website, { shouldDirty: true });
            if (typeof v.contactEmail === "string") form.setValue("contactEmail", v.contactEmail, { shouldDirty: true });
            if (typeof v.founded === "string") form.setValue("founded", v.founded, { shouldDirty: true });
            if (typeof v.subdomain === "string") form.setValue("subdomain", v.subdomain, { shouldDirty: true });
            if (typeof v.orgImage === "string") form.setValue("orgImage", v.orgImage, { shouldDirty: true });

            if (Array.isArray(v.therapeuticsInDevelopment)) {
                form.setValue("therapeuticsInDevelopment", v.therapeuticsInDevelopment, { shouldDirty: true });
            }
            if (Array.isArray(v.therapeuticsOfInterest)) {
                form.setValue("therapeuticsOfInterest", v.therapeuticsOfInterest, { shouldDirty: true });
            }

            // CONDITION
            if (Array.isArray(v.disorder) && v.disorder.length) {
                form.setValue("disorder", v.disorder.slice(0, 1), { shouldDirty: true });
            }
            if (Array.isArray(v.associatedConditions)) {
                form.setValue("associatedConditions", v.associatedConditions.slice(0, 5), { shouldDirty: true });
            }
            if (typeof v.summary === "string") {
                form.setValue("summary", v.summary, { shouldDirty: true });
            }
            if (Array.isArray(v.categories)) {
                form.setValue("categories", v.categories, { shouldDirty: true });
            }
            if (Array.isArray(v.causal)) {
                form.setValue("causal", v.causal, { shouldDirty: true });
            }
            if (Array.isArray(v.genes)) {
                form.setValue("genes", v.genes, { shouldDirty: true });
            }
            if (Array.isArray(v.systems)) {
                form.setValue("systems", v.systems, { shouldDirty: true });
            }
            if (Array.isArray(v.symptoms)) {
                form.setValue("symptoms", v.symptoms, { shouldDirty: true });
            }

            mixpanelTrack("Agent Filled Create Org Form", {
                inputUrl,
                website: v.website,
                name: v.name,
                hasDisorder: Boolean(v.disorder?.length),
            });

            toast.success("Filled form from website. Review and edit, then complete sign-up.");
        } catch (e: any) {
            toast.error(e?.message || "Failed to fill form.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">Fill form with AI</h2>
            <p className="text-sm text-muted-foreground">
                Paste a patient advocacy group (PAG) website. We’ll extract org + condition details to prefill the form — you
                review and submit.
            </p>

            <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.org"
                aria-label="Organization website"
            />

            <Button type="button" variant="cta" disabled={disabled} onClick={onFill}>
                {loading ? (
                    <div className="w-[88px] flex justify-center items-center">
                        <LoadingDots />
                    </div>
                ) : (
                    "Fill form"
                )}
            </Button>

            {!isLikelyHttpUrl(url.trim()) && url.trim().length > 0 && (
                <p className="text-xs text-muted-foreground">Enter a valid URL starting with http:// or https://</p>
            )}
        </section>
    );
}
