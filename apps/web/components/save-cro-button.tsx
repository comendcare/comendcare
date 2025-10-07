"use client"

import {useEffect, useState} from "react";
import {Company, Prisma, SavedCompany} from "@prisma/client";
import {Button} from "@comend/components/ui/button";
import {toast} from "sonner";
import {getSavedCompaniesFromOrganizationId} from "@comend/lib/fetchers";
import {useSession} from "next-auth/react";
import va from "@vercel/analytics"
import {saveCRO} from "@comend/lib/actions";
import {useRouter} from "next/navigation";
import {Bookmark} from "lucide-react";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";


export default function SaveCROButton({cro, type, location, savedCompanyIds}: {
    cro: Company,
    type: "card" | "page",
    location?: string,
    savedCompanyIds?: Set<string>
}) {
    const router = useRouter()
    const {data: session} = useSession();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (savedCompanyIds) {
            setIsSaved(savedCompanyIds.has(cro.id));
        }
    }, [savedCompanyIds, cro.id]);

    const onSubmit = async () => {
        try {

            const response = await saveCRO(
                session?.user?.organizationId || undefined,
                cro.id,
            );

            if (response.success && response.data) {
                va.track("Saved CRO");

                // Safe analytics payload building
                const baseProps: Record<string, any> = {
                    Location: location,
                    "Service Provider Name": response.data.company.title,
                    "Service Provider ID": response.data.company.id,
                };

                mixpanelTrack("Service Provider Saved", baseProps);

                router.refresh();
                toast.success("Successfully saved service provider!");
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again later.");
            console.error("Error saving cro:", error);
        } finally {
        }
    };

    if (type === "page") {
        return (
            <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <Button
                        variant="secondary"
                        className="w-fit onborda-save-service-provider"
                        disabled={!session?.user?.organizationId}
                        onClick={onSubmit}
                    >
                        {isSaved ? (
                            <Bookmark fill="currentColor" className="mr-2"/>
                        ) : (
                            <Bookmark className="mr-2"/>
                        )}
                        Save Service Provider
                    </Button>
                </TooltipTrigger>
                {!session?.user?.organizationId && (
                    <TooltipContent>
                        <p>Please join an organization to enable Service Provider saving.</p>
                    </TooltipContent>
                )}
            </Tooltip>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                <Button
                    variant="ghost"
                    className="w-fit onborda-save-service-provider"
                    disabled={!session?.user?.organizationId}
                    onClick={onSubmit}
                >
                    {isSaved ? <Bookmark fill="currentColor"/> : <Bookmark/>}
                </Button>
            </TooltipTrigger>
            {!session?.user?.organizationId && (
                <TooltipContent>
                    <p>Please join an organization to enable Service Provider saving.</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
}
