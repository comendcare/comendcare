"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {inviteUser} from "@/lib/actions";
import {useParams} from "next/navigation";
import {getIp} from "@/lib/utils";
import {useEffect, useState} from "react";
import {Organization} from "@prisma/client";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {toast} from "sonner";

const invitationFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

export default function InvitationForm() {
    const session = useSession()
    const params = useParams()

    const [organization, setOrganization] = useState<Organization | null>();

    useEffect(() => {
        getOrganizationFromOrganizationId(params?.id as string).then((response) => {
            if (response.success) {
                const organization = response.data
                setOrganization(organization)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        })
    }, [params?.id, setOrganization]);

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema)
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        try {
            const response = await inviteUser(
                session.data,
                form.getValues("email"),
                "member",
                await getIp(),
                {
                    organizationId: params?.id as string,
                    organizationName: organization?.name as string,
                    organizationImage: organization?.image as string,
                }
            )

            if (response.success) {
                const invitation = response.data
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                The invitation to your organization will be sent
                                here.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
