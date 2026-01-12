"use client";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@comend/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@comend/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteUser } from "@comend/lib/actions";
import { getIp } from "@comend/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@comend/components/ui/input";
import { Button } from "@comend/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog";
import { toast } from "sonner";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";
import { UserPlus } from "lucide-react";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import LoadingDots from "@comend/components/icons/loading-dots";
import type {Organization} from "@prisma/client";

const invitationFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    role: z.enum(["member", "owner"], { message: "Role must be either Member or Owner." }),
});

export default function InviteUserToOrgDialog({organization}: {organization: Organization}) {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
        defaultValues: { role: "member" },
    });

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        setLoading(true);
        try {
            const response = await inviteUser(
                organization?.id as string, // organizationId
                values.email,
                values.role,
                await getIp()
            );

            if (response.success) {
                const invitation = response.data;
                setIsOpen(false);

                mixpanelTrack("Membership Invitation Sent", {
                    Email: invitation.email,
                    Role: invitation.role,
                });

                toast.success(`Invitation to ${invitation.email} sent successfully.`);
                window.location.reload();
            } else {
                console.error(response.error);
                toast.error(response.error);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    const disabled = !["owner", "support"].includes(session?.user?.membership?.role) || status !== "authenticated";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-x-2" disabled={disabled} variant={'cta'}>
                    <UserPlus />
                    Invite user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite user</DialogTitle>
                    <DialogDescription>
                        {`You can invite users by providing their email here.
            If they don't already have an account they will be asked to create one.`}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormDescription>The invitation to your organization will be sent here.</FormDescription>
                                    <FormControl>
                                        <Input type="email" placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormDescription>Choose the role for the invited user.</FormDescription>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="owner">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="w-full flex justify-end">
                            <Button type="submit" disabled={loading || !organization} variant={'cta'}>
                                {loading ? <LoadingDots /> : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
