"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {inviteUser} from "@/lib/actions";
import {getIp} from "@/lib/utils";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Organization} from "@prisma/client";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {toast} from "sonner";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import { UserPlus } from "lucide-react";
import mixpanel from "mixpanel-browser";

const invitationFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    role: z.enum(["member", "owner"], { message: "Role must be either Member or Owner." }),
})

export default function InviteUserToOrgDialog() {
    const session = useSession();
    const router = useRouter()

    const [organization, setOrganization] = useState<Organization | null>();
    const [isOpen, setIsOpen] = useState(false); // Control dialog state

    useEffect(() => {
        session.data?.user?.organizationId ? getOrganizationFromOrganizationId(session.data?.user?.organizationId).then((response) => {
            if (response.success) {
                const organization = response.data
                setOrganization(organization)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }) : toast.error("No organizationId provided")
    }, [session.data?.user?.organizationId, setOrganization]);

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
        defaultValues: {
            role: "member"
        }
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        try {
            const response = await inviteUser(
                session.data,
                form.getValues("email"),
                form.getValues("role"),
                await getIp(),
                {
                    organizationId: organization?.id as string,
                    organizationName: organization?.name as string,
                    organizationImage: organization?.image as string,
                }
            )

            if (response.success) {
                const invitation = response.data
                setIsOpen(false)

                mixpanelTrack("Membership Invitation Sent", {
                    "Email": invitation.email,
                    "Role": invitation.role
                })
                
                toast.success(`Invitation to ${invitation.email} sent successfully.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-x-2">
                    <UserPlus />
                    Invite user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Invite user
                    </DialogTitle>
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
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Email
                                    </FormLabel>
                                    <FormDescription>
                                        The invitation to your organization will be sent here.
                                    </FormDescription>
                                    <FormControl>
                                        <Input type="email" placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormDescription>
                                        Choose the role for the invited user.
                                    </FormDescription>
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

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
