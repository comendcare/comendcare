"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Organization, Prisma, SavedOrganization } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSavedOrganizationsFromOrganizationId } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import {Form} from "@/components/ui/form";
import va from "@vercel/analytics"
import {saveOrganization} from "@/lib/actions";
import {useRouter} from "next/navigation";
import { Bookmark } from "lucide-react";
import { mixpanelTrack } from "@/mixpanel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

const formSchema = z.object({});

type SaveOrganizationFormData = z.infer<typeof formSchema>;

export default function SaveOrganizationDialog({ savedOrganization, type }: { savedOrganization: Organization, type: "card" | "page" }) {
    const router = useRouter()
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [open, setOpen] = useState(false); // New state for dialog open/close

    const form = useForm<SaveOrganizationFormData>({
        resolver: zodResolver(formSchema),
    })

    useEffect(() => {
        async function fetchData() {
            const savedOrganizationsResponse = await getSavedOrganizationsFromOrganizationId(session?.user?.organizationId || undefined, {
                id: true,
                organizationId: true,
                organization: true,
                savedOrganizationId: true,
                savedOrganization: true,
                updatedAt: true,
                createdAt: true,
                metadata: true
            });
            if (savedOrganizationsResponse.success) {
                const savedOrganizationData = savedOrganizationsResponse.data as SavedOrganization[];
                setIsSaved(savedOrganizationData.some(sc => sc.savedOrganizationId === savedOrganization.id));
            } else {
                console.error(savedOrganizationsResponse.error);
            }
        }

        fetchData();
    }, [session?.user?.organizationId, savedOrganization.id])

    const onSubmit = async (data: SaveOrganizationFormData) => {
        setIsSubmitting(true);
        try {
            const response = await saveOrganization(session?.user?.organizationId, savedOrganization.id)

            if (response.success && response.data) {
                va.track("Shortlisted Organization");
                mixpanelTrack("Organization Saved", {
                    "Location": location,
                    "Saver Organization Name": response.data.organization.title,
                    "Saver Organization ID": response.data.organization.id,
                    "Saved Organization Name": response.data.savedOrganization.name,
                    "Saved Organization Id": response.data.savedOrganization.name,
                })
                router.refresh();
                toast.success("Successfully saved organization!");
                setOpen(false)
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error(
                "An unexpected error occurred. Please try again later."
            );
            console.error("Error saving organization:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <DialogTrigger asChild>
                    {type === "page" ? (
                        <Button variant="secondary" className="w-fit onborda-save-service-provider" disabled={!session?.user?.organizationId}>
                            {isSaved ? <Bookmark fill="currentColor" className="mr-2" /> : <Bookmark className="mr-2" />} Save Organization
                        </Button>
                    ) : (
                        <Button variant="ghost" className="w-fit onborda-save-service-provider" disabled={!session?.user?.organizationId}>
                            {isSaved ? <Bookmark fill="currentColor" /> : <Bookmark />}
                        </Button>
                    )}
                    </DialogTrigger>
                </TooltipTrigger>
                {!session?.user?.organizationId && (
                    <TooltipContent>
                        <p>Please join an organization to enable Organization shortlisting.</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Save {savedOrganization.name} to shortlist</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Add additional form fields here if we decide saved organizations need to link to something. */}
                        <Button type="submit" disabled={isSubmitting} className="w-full" onClick={(e) => e.stopPropagation()}>
                            {isSubmitting ? "Shortlisting..." : "Shortlist Organization"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
