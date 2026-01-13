"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
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
import {useSession} from "next-auth/react";
import type {Organization} from "@prisma/client";
import React, {useEffect, useState} from "react";
import MoneyInput from "@comend/components/money-input";
import {years} from "@comend/lib/utils";
import {Pencil} from "lucide-react";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import {BiopharmaConsentSwitch} from "~web/components/biopharma-consent-switch";
import {checkSubdomainAvailability} from "@comend/lib/fetchers";
import {useDebounce} from "use-debounce";
import { ScrollArea, ScrollBar } from "@comend/components/ui/scroll-area";
import LoadingDots from "@comend/components/icons/loading-dots";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

const moneyField = z.preprocess(
    (v) => (v === "" || v === null || typeof v === "undefined" ? undefined : Number(v)),
    z.number().min(0).optional()
);

const editOrgFormSchema = z.object({
    name: z.string().min(2).max(60),
    subdomain: z.string().min(2, {
        message: "Your organization's nickname must be at least 2 characters."
    }).max(60, {
        message: "Your organization's nickname must be a maximum of 50 characters."
    }),
    contactEmail: z.preprocess(
        (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
        z.string().email({ message: "Please enter a valid email address." }).optional()
    ),
    founded: z.string().optional(),
    incorporationStatus: z.enum(["YES", "NO", "INPROGRESS"]).optional(),
    raised: moneyField,
    deployed: moneyField,
    budget: moneyField,
});

export default function EditPAGProfileHeaderDialog({organization}: { organization: Organization }) {
    const {data: session} = useSession();
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [unsavedChangesIsOpen, setUnsavedChangesIsOpen] = useState(false)
    const isOwner = ["owner", "support"].includes(session?.user?.membership?.role);

    const editOrgForm = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onSubmit",
        reValidateMode: "onSubmit",
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
        const isValid = editOrgForm.trigger()
        if (!isValid) return // stops submission
        
        setIsSaving(true)
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
            closeDialog()
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    const closeDialog = () => {
        setOpen(false)
        setIsClosing(false)
        setUnsavedChangesIsOpen(false)

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

    const handleClose = ({showUnsavedChanges}: {showUnsavedChanges?: boolean}) => {
        if (showUnsavedChanges && Object.keys(editOrgForm.formState.dirtyFields).length > 0) {
            // form is dirty, give user the option to save/discard unsaved changes
            setUnsavedChangesIsOpen(true)
        } else {
            // form is not dirty, close regularly
            closeDialog()
        }
    }

    useEffect(() => {
        if (isClosing) handleClose({showUnsavedChanges: true}) // external close, handle closing with option for saving unsaved changes
    }, [isClosing])

    useEffect(() => {
        // if the user has closed the unsaved changes dialog, end the isClosing state of all other dialogs
        // all dialogs should be either fully closed or fully open
        if (!unsavedChangesIsOpen) setIsClosing(false)
    }, [unsavedChangesIsOpen])

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
            onOpenChange={(open) => {
                if (!open) setIsClosing(true)
                else setOpen(true)
            }}
        >
            {isOwner ? (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        className="organization-profile-tour-step3"
                        data-testid="header-edit-btn"
                    >
                        <Pencil/>
                    </Button>
                </DialogTrigger>
            ) : (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <Button
                                variant="ghost"
                                className="organization-profile-tour-step3"
                                disabled
                            >
                                <Pencil/>
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>
                            Profile editing is only enabled for organization owners. Please contact
                            the owners of your organization. Owners are visible in the Organization
                            Settings tab in the memberships section.
                        </p>
                    </TooltipContent>
                </Tooltip>
            )}
            <DialogContent data-testid="dialog">
                <DialogHeader>
                    <DialogTitle>Edit Organization Profile</DialogTitle>
                    <DialogDescription>{`Update your organization's details.`}</DialogDescription>
                </DialogHeader>
                <Form {...editOrgForm}>
                    <form 
                        onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} 
                        className="flex max-h-[80vh] flex-col overflow-hidden"
                    >
                        <ScrollArea type={"always"}>
                        <ScrollBar />
                            <div className="flex flex-col gap-4 pr-4 space-y-8">
                            <FormField
                                control={editOrgForm.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Organization Name</FormLabel>
                                        <FormControl><Input {...field} data-testid="org-name-input" /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editOrgForm.control}
                                name="subdomain"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Custom Comend URL</FormLabel>
                                        <FormDescription>
                                            {/* {`This will create your organization's unique Comend profile link (e.g., yourname.comend.io). Use a short name or abbreviation. This is not your external website.`} */}
                                            {/* <br/> */}
                                            {editOrgForm.watch("subdomain") &&
                                                !editOrgForm.formState.errors.subdomain && (
                                                    <>
                                                        {`Your profile URL will be: ${editOrgForm
                                                            .watch("subdomain")
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")}.comend.io`}
                                                    </>
                                                )}
                                        </FormDescription>
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
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editOrgForm.control}
                                name="founded"
                                render={({ field }) => (
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
                                                <SelectTrigger data-testid="founded-select-trigger">
                                                    <SelectValue placeholder="Select a year" />
                                                </SelectTrigger>
                                            </FormControl>

                                            {/* Radix renders this in a portal */}
                                            <SelectContent data-testid="founded-select-content">
                                                {years.map((year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year.toString()}
                                                        data-testid={`founded-option-${year}`}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
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
                            </div>
                        </ScrollArea>

                        <DialogFooter className="pt-4">
                        <Button 
                            type="button"
                            variant={"secondary"}
                            onClick={() => {handleClose({showUnsavedChanges: false})}}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={"cta"}
                            type="submit"
                            data-testid="dialog-save-btn"
                            disabled={isSaving}
                        >
                            {isSaving 
                                ? (
                                    <div className="w-[81px] flex justify-center items-center">
                                        <LoadingDots/>
                                    </div>
                                ) 
                                : ("Save changes")
                            }
                        </Button>
                        </DialogFooter>

                        <UnsavedChangesDialog 
                            isSaving={isSaving}
                            isClosing={isClosing}
                            setIsClosing={setIsClosing}
                            isOpen={unsavedChangesIsOpen}
                            setIsOpen={setUnsavedChangesIsOpen}
                            closeDialog={closeDialog}
                            form={editOrgForm}
                            formSubmit={onProfileFormSubmit}
                        />
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
