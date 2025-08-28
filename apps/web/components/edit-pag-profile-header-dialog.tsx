"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@comend/components/ui/tabs";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@comend/components/ui/form";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@comend/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@comend/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group";
import {Button} from "@comend/components/ui/button";
import {updateOrganization} from "@comend/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";
import React, {useEffect, useState} from "react";
import MoneyInput from "@comend/components/money-input";
import {years} from "@comend/lib/utils";
import {Pencil} from "lucide-react";
import {Tooltip} from "@comend/components/plate-ui/tooltip";
import {TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import {BiopharmaConsentSwitch} from "~web/components/biopharma-consent-switch";
import {checkSubdomainAvailability} from "@/packages/lib/fetchers";
import {useDebounce} from "use-debounce";

const editOrgFormSchema = z.object({
    name: z.string().min(2).max(60),
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }).max(60, {
        message: "Your organization's nickname must be a maximum of 50 characters."
    }),
    contactEmail: z.string().email({ message: "Please enter a valid email address." }),
    founded: z.string().optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"]).optional(),
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
            contactEmail: organization.contactEmail || "",
            subdomain: organization.subdomain || "",
            incorporationStatus: organization.incorporationStatus || undefined,
            raised: organization.moneyRaised || 0,
            deployed: organization.moneyDeployed || 0,
            budget: organization.researchBudget || 0
        }
    });

    const [debouncedNickname] = useDebounce(editOrgForm.watch("subdomain"), 500); // Extract just the debounced value

    useEffect(() => {
        console.log("Resetting form with organization data:", organization);
        editOrgForm.reset({
            name: organization.name || "",
            founded: organization.yearFounded || "",
            contactEmail: organization.contactEmail || "",
            subdomain: organization.subdomain || "",
            incorporationStatus: organization.incorporationStatus || undefined,
            raised: organization.moneyRaised || 0,
            deployed: organization.moneyDeployed || 0,
            budget: organization.researchBudget || 0
        });
    }, [organization, editOrgForm]);

    async function onProfileFormSubmit(values: z.infer<typeof editOrgFormSchema>) {
        console.log("Form submitted with values:", values);

        if (!session?.user?.organizationId) {
            console.error("No organization ID found in session.");
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        const fieldMapping: Record<string, string> = {
            name: "name",
            subdomain: "subdomain",
            looking: "interestedModalities",
            founded: "yearFounded",
            contactEmail: "contactEmail",
            incorporationStatus: "incorporationStatus",
            raised: "moneyRaised",
            budget: "researchBudget",
            deployed: "moneyDeployed",
        };

        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = fieldMapping[key];
            if (mappedKey && value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(mappedKey, JSON.stringify(value));
                } else {
                    formData.append(mappedKey, value.toString());
                }
            }
        });

        console.log("Submitting FormData:", formData);

        try {
            await updateOrganization(session.user.organizationId, formData);
            console.log("Organization update success");
            toast.success("Organization profile updated successfully!");
            setOpen(false);
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    useEffect(() => {
        if (debouncedNickname) {
            const currentSubdomain = organization?.subdomain; // The current subdomain of the organization

            if (debouncedNickname === currentSubdomain) {
                // Clear errors since it's the same subdomain as before
                editOrgForm.clearErrors("subdomain");
                return;
            }

            checkSubdomainAvailability(debouncedNickname).then((isAvailable) => {
                if (!isAvailable) {
                    editOrgForm.setError("subdomain", {
                        type: "manual",
                        message: "This nickname is already taken. Please choose another.",
                    });
                    console.log("Not available");
                } else {
                    editOrgForm.clearErrors("subdomain");
                    console.log("Available");
                }
            });
        }
    }, [debouncedNickname, organization?.subdomain, editOrgForm])

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                if (!state) {
                    // Reset the form when dialog is closing (user didn't save)
                    editOrgForm.reset({
                        name: organization.name || "",
                        founded: organization.yearFounded || "",
                        subdomain: organization.subdomain || "",
                        incorporationStatus: organization.incorporationStatus || undefined,
                        raised: organization.moneyRaised || 0,
                        deployed: organization.moneyDeployed || 0,
                        budget: organization.researchBudget || 0
                    });
                }
                setOpen(state);
            }}
        >
            <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="organization-profile-tour-step3"
                            onClick={() => console.log("DialogTrigger clicked")}
                            disabled={session?.user?.membership?.role !== "owner"}
                        >
                            <Pencil/>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {session?.user?.membership?.role !== "owner" && (
                    <TooltipContent className="max-w-80">
                        <p>Profile editing is only enabled for organization owners. Please contact the owners of your
                            organization. Owners are visible in the Organization Settings tab in the memberships
                            section.</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Organization Profile</DialogTitle>
                    <DialogDescription>{`Update your organization's details.`}</DialogDescription>
                </DialogHeader>
                {/*<Tabs defaultValue="organization">*/}
                {/*    <TabsList>*/}
                {/*        <TabsTrigger value="organization">Organization</TabsTrigger>*/}
                {/*        <TabsTrigger value="finances">Finances</TabsTrigger>*/}
                {/*    </TabsList>*/}
                {/*    <TabsContent value="organization">*/}
                <Form {...editOrgForm}>
                    <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                        <FormField
                            control={editOrgForm.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editOrgForm.control}
                            name="subdomain"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Public URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            id="name"
                                            autoComplete="name"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
                                                field.onChange(value); // Update the form state with processed value
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editOrgForm.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={editOrgForm.control}
                            name="founded"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Year Founded</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            console.log("Year selected:", value);
                                            field.onChange(`${value}-01-01`);
                                        }}
                                        defaultValue={field.value?.split("-")[0]}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a year"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
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
                                    <FormLabel>What is your 501(c)(3) status?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                console.log("Radio selected:", value);
                                                field.onChange(value);
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="YES"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Yes, I have a 501(c)(3)
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

                        <MoneyInput
                            form={editOrgForm}
                            label="Total funds raised to date"
                            description="The total amount of funding raised to date by your patient group."
                            name="raised"
                        />

                        <MoneyInput
                            form={editOrgForm}
                            label="Total funds deployed to date"
                            description="The total amount of funds deployed to research by your patient group."
                            name="deployed"
                        />

                        <MoneyInput
                            form={editOrgForm}
                            label="Total annual research budget"
                            description="The total amount of funding budgeted for research by your patient group."
                            name="budget"
                        />

                        <BiopharmaConsentSwitch organization={organization}/>

                        <Button type="submit" onClick={() => console.log("Save (Org tab) clicked")}>
                            Save
                        </Button>
                    </form>
                </Form>
                {/*</TabsContent>*/}
                {/*    <TabsContent value="finances">*/}
                {/*        <Form {...editOrgForm}>*/}
                {/*            <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">*/}
                {/*                <MoneyInput*/}
                {/*                    form={editOrgForm}*/}
                {/*                    label="Total funds raised to date"*/}
                {/*                    description="The total amount of funding raised to date by your patient group."*/}
                {/*                    name="raised"*/}
                {/*                />*/}
                {/*                <MoneyInput*/}
                {/*                    form={editOrgForm}*/}
                {/*                    label="Total funds deployed to research"*/}
                {/*                    description="The total amount of money deployed to research to date."*/}
                {/*                    name="deployed"*/}
                {/*                />*/}
                {/*                <MoneyInput*/}
                {/*                    form={editOrgForm}*/}
                {/*                    label="Annual research budget"*/}
                {/*                    description="The amount of money allocated to advancing research this year."*/}
                {/*                    name="budget"*/}
                {/*                />*/}
                {/*                <Button type="submit" onClick={() => console.log("Save (Finances tab) clicked")}>*/}
                {/*                    Save*/}
                {/*                </Button>*/}
                {/*            </form>*/}
                {/*        </Form>*/}
                {/*    </TabsContent>*/}
                {/*</Tabs>*/}
            </DialogContent>
        </Dialog>
    );
}
