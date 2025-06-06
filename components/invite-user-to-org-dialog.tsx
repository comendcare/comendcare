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
import { mixpanelTrack } from "@/app/mixpanel";
import LoadingDots from "@/components/icons/loading-dots";

const invitationFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    role: z.enum(["member", "owner"], { message: "Role must be either Member or Owner." }),
})

export default function InviteUserToOrgDialog() {
    const session = useSession();
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>();
    const [isOpen, setIsOpen] = useState(false); // Control dialog state

    useEffect(() => {
        session.data?.user?.organizationId ? getOrganizationFromOrganizationId(session.data?.user?.organizationId, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
        }).then((response) => {
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
        setLoading(true)
        try {
            const response = await inviteUser(
                organization?.id as string, // organizationId
                session.data,
                form.getValues("email"),
                form.getValues("role"),
                await getIp(),
                // {
                //     organizationId: organization?.id as string,
                //     organizationName: organization?.name as string,
                //     organizationImage: organization?.image as string,
                // }
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
        } finally {
            setLoading(false)
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

                        <Button type="submit">
                            {loading ? <LoadingDots color="#808080"/> : "Submit"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
