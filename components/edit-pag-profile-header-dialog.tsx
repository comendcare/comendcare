"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {updateOrganization} from "@/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";
import React, {useEffect, useState} from "react";
import MoneyInput from "@/components/money-input";
import {years} from "@/lib/utils";
import { Pencil } from "lucide-react";

const editOrgFormSchema = z.object({
    name: z.string().min(2).max(60),
    founded: z.string().optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"]).optional(),
    description: z.string().max(500).optional(),
    website: z.string().url().optional(),
    raised: z.number().optional(),
    deployed: z.number().optional(),
    budget: z.number().optional()
});

export default function EditPAGProfileHeaderDialog({organization}: { organization: Organization }) {
    const {data: session} = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            name: organization.name || "",
            founded: organization.yearFounded || "",
            incorporationStatus: organization.incorporationStatus || undefined,
            description: organization.description || "",
            website: organization.website || "",
            raised: organization.moneyRaised || 0,
            deployed: organization.moneyDeployed || 0,
            budget: organization.researchBudget || 0
        }
    });

    useEffect(() => {
        editOrgForm.reset({
            name: organization.name || "",
            founded: organization.yearFounded || "",
            incorporationStatus: organization.incorporationStatus || undefined,
            description: organization.description || "",
            website: organization.website || "",
            raised: organization.moneyRaised || 0,
            deployed: organization.moneyDeployed || 0,
            budget: organization.researchBudget || 0
        });
    }, [organization, editOrgForm]);

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        // Map form values to Prisma schema fields
        const fieldMapping: Record<string, string> = {
            name: "name",
            subdomain: "subdomain",
            looking: "interestedModalities",
            founded: "yearFounded",
            description: "description",
            website: "website",
            incorporationStatus: "incorporationStatus",
            image: "image",
            headerImage: "headerImage",
            raised: "moneyRaised",
            budget: "researchBudget",
            deployed: "moneyDeployed",
        };

        // Populate FormData with mapped fields
        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = fieldMapping[key];
            if (mappedKey && value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    // Handle array fields (e.g., `interestedModalities`)
                    formData.append(mappedKey, JSON.stringify(value));
                } else {
                    formData.append(mappedKey, value.toString());
                }
            }
        });

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization profile updated successfully!");
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="organization-profile-tour-step3"
                >
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit Organization Profile
                    </DialogTitle>
                    <DialogDescription>
                        {`Update your organization's details.`}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="organization">
                    <TabsList>
                        <TabsTrigger value="organization">Organization</TabsTrigger>
                        <TabsTrigger value="finances">Finances</TabsTrigger>
                    </TabsList>
                    <TabsContent value="organization">
                        <Form {...editOrgForm}>
                            <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                                <FormField control={editOrgForm.control} name="name" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Organization Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>

                                <FormField
                                    control={editOrgForm.control}
                                    name="founded"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Year Founded</FormLabel>
                                            {/*<FormDescription>*/}
                                            {/*    Select the year your organization was founded.*/}
                                            {/*</FormDescription>*/}
                                            <Select
                                                onValueChange={(value) => field.onChange(`${value}-01-01`)} // Convert year to a date string
                                                defaultValue={field.value?.split("-")[0]} // Extract the year from the date string for the default value
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a year"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year}
                                                            value={year.toString()}
                                                        >
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editOrgForm.control}
                                    name="incorporationStatus"
                                    render={({field}) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>{`What is your 501(c)(3) status?`}</FormLabel>
                                            {/*<FormDescription>{`Whether you have incorporated your patient group as a non-profit yet.`}</FormDescription>*/}
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="YES"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`Yes, I have a 501(c)(3)`}
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="INPROGRESS"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`No, but I'm working on it`}
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="NO"/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {`No, I don't have a 501(c)(3)`}
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Save</Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="finances">
                        <Form {...editOrgForm}>
                            <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                                <MoneyInput
                                    form={editOrgForm}
                                    label="Total funds raised to date"
                                    description="The total amount of funding raised to date by your patient group."
                                    name="raised"
                                />

                                <MoneyInput
                                    form={editOrgForm}
                                    label="Total funds deployed to research"
                                    description="The total amount of money deployed to research to date."
                                    name="deployed"
                                />

                                <MoneyInput
                                    form={editOrgForm}
                                    label="Annual research budget"
                                    description="The amount of money allocated to advancing research this year."
                                    name="budget"
                                />

                                <Button type="submit">Save</Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
