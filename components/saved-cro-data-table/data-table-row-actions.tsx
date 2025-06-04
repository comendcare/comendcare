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
import {SavedCompany} from "@prisma/client";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "sonner";
import {getMilestones, getSavedCompaniesFromOrganizationId} from "@/lib/fetchers";
import {signOut, useSession} from "next-auth/react";
import {Form, FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription} from "@/components/ui/form";
import va from "@vercel/analytics"
import {editSavedCRO, unsaveCRO} from "@/lib/actions";
import {useRouter} from "next/navigation";
import {Milestone, MILESTONE_TYPE_OPTIONS, SavedCompanyData} from "@/lib/types";
import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "@/app/mixpanel";
import ProjectMultipleSelector from "../project-multiple-selector";

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

export function DataTableRowActions<TData extends SavedCompanyData>({
                                               row,
                                           }: DataTableRowActionsProps<TData>) {
    const router = useRouter()
    const {data: session} = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    console.log(row)

    const form = useForm<SaveCROFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // engagement: row.original.engagement,
            // milestoneId: row.original.milestoneId,
            milestones: ([row.original.milestone])
        }
    });

    useEffect(() => {
        async function fetchData() {
            const savedCompaniesResponse = await getSavedCompaniesFromOrganizationId(session?.user?.organizationId || undefined);
            if (savedCompaniesResponse.success) {
                const savedCompaniesData = savedCompaniesResponse.data as SavedCompany[];
                setSavedCompanies(savedCompaniesData);
                setIsSaved(savedCompaniesData.some(sc => sc.companyId === row.id));
            } else {
                console.error(savedCompaniesResponse.error);
            }
        }

        fetchData();
    }, [session?.user?.organizationId, row.id]);

    const onSubmit = async (data: SaveCROFormData) => {
        setIsSubmitting(true);
        try {
            if (!data.milestones?.[0]?.id) {
                console.error(`Error: Invalid milestone ID`)
            }
            const response = await editSavedCRO(row.original.organizationId, row.original.id, data.milestones[0].id);

            if (response.success && response.data) {
                va.track("Edited saved CRO");
                mixpanelTrack("Service Provider Save Edited", {
                    "Service Provider Name": response.data.company.title,
                    "Service Provider ID": response.data.company.id,
                    "Milestone Title": response.data.milestone.title,
                    "Milestone ID": response.data.milestone.id,
                    "Milestone Types": response.data.milestone.types.map((type: any) => MILESTONE_TYPE_OPTIONS.find(t => t.id === type.milestoneTypeId)?.label),
                    "Milestone Budget": response.data.milestone.budget
                })
                router.refresh();
                toast.success("Successfully edited saved cro!");
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error(
                "An unexpected error occurred. Please try again later."
            );
            console.error("Error saving cro:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnsaveCRO = async () => {
        try {
            const response = await unsaveCRO(row.original.organizationId, row.original.id)

            if (response.success && response.data) {
                mixpanelTrack("Service Provider Unsaved", {
                    "Service Provider Name": response.data.company.title,
                    "Service Provider ID": response.data.company.id,
                    "Milestone Title": response.data.milestone.title,
                    "Milestone ID": response.data.milestone.id,
                    "Milestone Types": response.data.milestone.types.map((type: any) => MILESTONE_TYPE_OPTIONS.find(t => t.id === type.milestoneTypeId)?.label),
                    "Milestone Budget": response.data.milestone.budget
                })
                router.refresh()
                toast.success("Unsaved company successfully.");
            } else {
                toast.error("Failed to unsave company. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    };

    return (
        <Dialog>
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
                    <DialogTrigger asChild>
                        <DropdownMenuItem>
                            Edit
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        onClick={handleUnsaveCRO}
                    >
                        Unsave
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu><DialogContent>
            <DialogHeader>
                <DialogTitle>Save {row.original.company.title}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/*<FormField*/}
                    {/*    control={form.control}*/}
                    {/*    name="engagement"*/}
                    {/*    render={({field}) => (*/}
                    {/*        <FormItem>*/}
                    {/*            <FormLabel>Engagement Type</FormLabel>*/}
                    {/*            <FormControl>*/}
                    {/*                <RadioGroup onValueChange={field.onChange} value={field.value}>*/}
                    {/*                    {engagementOptions.map(({id, label}) => (*/}
                    {/*                        <div key={id} className="flex items-center space-x-3">*/}
                    {/*                            <RadioGroupItem value={id}/>*/}
                    {/*                            <Label className="font-normal">{label}</Label>*/}
                    {/*                        </div>*/}
                    {/*                    ))}*/}
                    {/*                </RadioGroup>*/}
                    {/*            </FormControl>*/}
                    {/*            <FormMessage/>*/}
                    {/*        </FormItem>*/}
                    {/*    )}*/}
                    {/*/>*/}

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Milestone</FormLabel>
                                <FormDescription>
                                    For which milestone would you like to connect with this company?
                                </FormDescription>
                                <FormControl>
                                    {/* <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a milestone"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fetchedMilestones.map((milestone) => (
                                                <SelectItem key={milestone.id} value={milestone.id}>
                                                    {milestone.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select> */}
                                    <ProjectMultipleSelector value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Shortlisting..." : "Shortlist Company"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
        </Dialog>
    )
}
