"use client"

import { useEffect, useState } from "react";
import { Organization, SavedOrganization } from "@prisma/client";
import { Button } from "@comend/components/ui/button";
import { toast } from "sonner";
import { getSavedOrganizationsFromOrganizationId } from "@comend/lib/fetchers";
import { useSession } from "next-auth/react";
import {saveOrganization} from "@comend/lib/actions";
import {useRouter} from "next/navigation";
import { Bookmark } from "lucide-react";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";


export default function SaveOrganizationButton({ savedOrganization, type, savedOrganizationIds }: {
    savedOrganization: Organization,
    type: "card" | "page",
    savedOrganizationIds?: Set<string>
}) {
    const router = useRouter()
    const { data: session } = useSession();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (savedOrganizationIds) {
            setIsSaved(savedOrganizationIds.has(savedOrganization.id));
        }
    }, [savedOrganizationIds, savedOrganization.id]);

    const onSubmit = async () => {
        try {
            const response = await saveOrganization(session?.user?.organizationId, savedOrganization.id)

            if (response.success && response.data) {
                mixpanelTrack("Organization Saved", {
                    "Location": location,
                    "Saver Organization Name": response.data.organization.title,
                    "Saver Organization ID": response.data.organization.id,
                    "Saved Organization Name": response.data.savedOrganization.name,
                    "Saved Organization Id": response.data.savedOrganization.name,
                })
                router.refresh();
                toast.success("Successfully saved patient group!");
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error(
                "An unexpected error occurred. Please try again later."
            );
            console.error("Error saving patient group:", error);
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
                        Save Organization
                    </Button>
                </TooltipTrigger>
                {!session?.user?.organizationId && (
                    <TooltipContent>
                        <p>Please join an organization to enable Organization saving.</p>
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
                    <p>Please join an organization to enable Organization saving.</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
}
