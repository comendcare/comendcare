"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@comend/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@comend/components/ui/input";
import { Button } from "@comend/components/ui/button";
import { updateOrganization } from "@comend/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Organization } from "@prisma/client";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";

// Schema for validating the contact email
const editContactEmailSchema = z.object({
    contactEmail: z.string().email({ message: "Please enter a valid email address." }),
});

export default function EditPAGContactEmailDialog({ organization }: { organization: Organization }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Initialize form with react-hook-form
    const editEmailForm = useForm<z.infer<typeof editContactEmailSchema>>({
        mode: "onChange",
        resolver: zodResolver(editContactEmailSchema),
        defaultValues: { contactEmail: organization.contactEmail || "" }
    });

    // Update form values when organization data changes
    useEffect(() => {
        editEmailForm.reset({
            contactEmail: organization.contactEmail || ""
        });
    }, [organization, editEmailForm]);

    // Form submission handler
    async function onProfileFormSubmit(values: z.infer<typeof editContactEmailSchema>) {
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();
        formData.append("contactEmail", values.contactEmail);

        try {
            await updateOrganization(session.user.organizationId, formData);
            toast.success("Contact email updated successfully!");
            setOpen(false);
            window.location.reload()
        } catch (error) {
            console.error("Error updating contact email:", error);
            toast.error("Failed to update contact email.");
        }
    }

    return (
        <TooltipProvider>
            <Dialog
                open={open}
                onOpenChange={(state) => {
                    if (!state) {
                        editEmailForm.reset({
                            contactEmail: organization.contactEmail || ""
                        });
                    }
                    setOpen(state);
                }}
            >
                <Tooltip>
                    <TooltipTrigger onClick={(e) => e.preventDefault()}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" disabled={session?.user?.membership?.role !== "owner"}>
                                <Pencil />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    {session?.user?.membership?.role !== "owner" && (
                        <TooltipContent className="max-w-80">
                            <p>Profile editing is only enabled for organization owners. Please contact the owners of your organization. Owners are visible in the Organization Settings tab in the memberships section.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Contact Email</DialogTitle>
                        <DialogDescription>
                            Update the main email contact for your organization.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editEmailForm}>
                        <form onSubmit={editEmailForm.handleSubmit(onProfileFormSubmit)} className="space-y-6">
                            <FormField
                                control={editEmailForm.control}
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
                            <Button type="submit">Save</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
