"use client"

import {DotsHorizontalIcon} from "@radix-ui/react-icons"
import {Row} from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Prisma, SavedCompany} from "@prisma/client";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {getSavedCompaniesFromOrganizationId} from "@comend/lib/fetchers";
import {useSession} from "next-auth/react";
import {unsaveOrganization} from "@comend/lib/actions";
import {useRouter} from "next/navigation";
import {Milestone, MILESTONE_TYPE_OPTIONS} from "@comend/lib/types";
import { mixpanelTrack } from "@/mixpanel";

const formSchema = z.object({
    // engagement: z.nativeEnum(OrganizationToCompanyEngagement, {
    //     errorMap: () => ({message: "Select a valid engagement type"})
    // }),
    // milestoneId: z.string().min(1, "Please select a milestone"),
    milestones: z.array(z.custom<Milestone>())
        .min(1, "Please select a project")
        .max(1, "Cannot select more than one project")
});

type SaveCROFormData = z.infer<typeof formSchema>;

const engagementOptions = [
    {id: "EXPLORING", label: "Exploring (Shortlist)"},
    {id: "QUOTE", label: "Needs a Quote"},
    {id: "COLLABORATING", label: "Currently Collaborating"},
    {id: "COLLABORATED", label: "Previously Worked With"},
];

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends Prisma.SavedOrganizationGetPayload<{include: {organization: true, savedOrganization: true}}>>({
                                               row,
                                           }: DataTableRowActionsProps<TData>) {
    const router = useRouter()

    const form = useForm<SaveCROFormData>({
        resolver: zodResolver(formSchema)
    });

    const handleUnsaveOrganization = async () => {
        try {
            const response = await unsaveOrganization(row.original.organizationId, row.original.id)

            if (response.success && response.data) {
                mixpanelTrack("Organization Unsaved", {
                    "Location": location,
                    "Saver Organization Name": response.data.organization.title,
                    "Saver Organization ID": response.data.organization.id,
                    "Saved Organization Name": response.data.savedOrganization.name,
                    "Saved Organization Id": response.data.savedOrganization.name,
                })
                router.refresh()
                toast.success("Unsaved patient group successfully.");
            } else {
                toast.error("Failed to unsave patient group. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4"/>
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                    onClick={handleUnsaveOrganization}
                >
                    Unsave
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
