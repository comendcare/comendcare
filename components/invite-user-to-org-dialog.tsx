"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
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
import {FaUserPlus} from "react-icons/fa6";
import {toast} from "sonner";
import {getMembersAndInvitees, getOrganizationFromOrganizationId} from "@/lib/fetchers";

const invitationFormSchema = z.object({
    email: z.string().min(3, {
        message: "Email must be at least 3 characters.",
    }),
})

export default function InviteUserToOrgDialog() {
    const session = useSession();
    const router = useRouter()

    const [organization, setOrganization] = useState<Organization | null>();

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
    }, [setOrganization]);

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        await inviteUser(
            session.data,
            form.getValues("email"),
            "admin",
            await getIp(),
            {
                organizationId: organization?.id as string,
                organizationName: organization?.name as string,
                organizationImage: organization?.image as string,
            }
        ).then(
            async (res) => {
                router.refresh()
                toast.success(`Invitation successfully sent to ${res.email}`)
            }
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-x-2">
                    <FaUserPlus/>
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
                                    <FormControl>
                                        <Input type="email" placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The invitation to your organization will be sent here.
                                    </FormDescription>
                                    <FormMessage/>
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