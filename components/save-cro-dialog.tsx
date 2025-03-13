"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { Company, OrganizationToCompanyEngagement, Milestone, SavedCompany } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getMilestones, getSavedCompaniesFromOrganizationId } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";

const formSchema = z.object({
    engagement: z.nativeEnum(OrganizationToCompanyEngagement, {
        errorMap: () => ({ message: "Select a valid engagement type" })
    }),
    milestoneId: z.string().min(1, "Please select a milestone"),
});

type SaveCROFormData = z.infer<typeof formSchema>;

const engagementOptions = [
    { id: "EXPLORING", label: "Exploring (Shortlist)" },
    { id: "QUOTE", label: "Needs a Quote" },
    { id: "COLLABORATING", label: "Currently Collaborating" },
    { id: "COLLABORATED", label: "Previously Worked With" },
];

export default function SaveCRODialog({ cro, type }: { cro: Company, type: "card" | "page" }) {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([]);
    const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    const form = useForm<SaveCROFormData>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        async function fetchData() {
            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined);
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse.data as Milestone[]);
            } else {
                console.error(milestonesResponse.error);
            }

            const savedCompaniesResponse = await getSavedCompaniesFromOrganizationId(session?.user?.organizationId || undefined);
            if (savedCompaniesResponse.success) {
                const savedCompaniesData = savedCompaniesResponse.data as SavedCompany[];
                setSavedCompanies(savedCompaniesData);
                setIsSaved(savedCompaniesData.some(sc => sc.companyId === cro.id));
            } else {
                console.error(savedCompaniesResponse.error);
            }
        }

        fetchData();
    }, [session?.user?.organizationId, cro.id]);

    const onSubmit = async (data: SaveCROFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/saved-company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: cro.id,
                    milestoneId: data.milestoneId,
                    engagement: data.engagement,
                }),
            });
            if (!response.ok) throw new Error("Failed to save company");
            toast.success("Company saved successfully!");
            setIsSaved(true);
        } catch (error) {
            toast.error("Error saving company");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {type === "page" ? (
                    <Button variant="secondary" className="w-fit">
                        {isSaved ? <FaBookmark className="mr-2" /> : <FaRegBookmark className="mr-2" />} Save CRO
                    </Button>
                ) : (
                    <Button variant="ghost" className="w-fit">
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save {cro.title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="engagement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Engagement Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                                            {engagementOptions.map(({ id, label }) => (
                                                <div key={id} className="flex items-center space-x-3">
                                                    <RadioGroupItem value={id} />
                                                    <Label className="font-normal">{label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="milestoneId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Milestone</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a milestone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fetchedMilestones.map((milestone) => (
                                                    <SelectItem key={milestone.id} value={milestone.id}>
                                                        {milestone.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Saving..." : "Save Company"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
