"use client"

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {FaBookmark} from "react-icons/fa6";
import {Company, OrganizationToCompanyEngagement, Milestone} from "@prisma/client";
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
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {getMilestones} from "@/lib/fetchers";
import {useSession} from "next-auth/react";

// Define form schema
const formSchema = z.object({
    engagement: z.nativeEnum(OrganizationToCompanyEngagement, {
        errorMap: () => ({message: "Select a valid engagement type"})
    }),
    milestoneId: z.string().min(1, "Please select a milestone"),
});

type SaveCROFormData = z.infer<typeof formSchema>;

export default function SaveCRODialog({
                                          cro,
                                      }: {
    cro: Company;
}) {
    const {data: session} = useSession()
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }
            // Allow update once form is initialized
        }

        fetchData()
    }, [])


    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<SaveCROFormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: SaveCROFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/saved-company", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    companyId: cro.id,
                    milestoneId: data.milestoneId,
                    engagement: data.engagement,
                }),
            });

            if (!response.ok) throw new Error("Failed to save company");

            toast.success("Company saved successfully!");
        } catch (error) {
            toast.error("Error saving company");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <FaBookmark className="mr-2"/>
                    Save CRO
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save {cro.title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Engagement Type</Label>
                        <Select onValueChange={(value) => setValue("engagement", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an engagement type"/>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(OrganizationToCompanyEngagement).map((engagement) => (
                                    <SelectItem key={engagement} value={engagement}>
                                        {engagement}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.engagement && <p className="text-red-500">{errors.engagement.message}</p>}
                    </div>

                    <div>
                        <Label>Milestone</Label>
                        <Select onValueChange={(value) => setValue("milestoneId", value)}>
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
                        </Select>
                        {errors.milestoneId && <p className="text-red-500">{errors.milestoneId.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Saving..." : "Save Company"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
