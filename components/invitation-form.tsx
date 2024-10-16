"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {getOrganizationFromOrganizationId, getOrganizationFromRoadmapId, inviteUser} from "@/lib/actions";
import {useParams} from "next/navigation";
import {getIp} from "@/lib/utils";
import {useEffect, useState} from "react";
import {Organization} from "@prisma/client";

const invitationFormSchema = z.object({
    email: z.string().min(2, {
        message: "Email must be at least 2 characters.",
    }),
})

export default function InvitationForm() {
    const session = useSession();
    const params = useParams()

    const [organization, setOrganization] = useState<Organization | null>();

    useEffect(() => {
        const organization = getOrganizationFromOrganizationId(params?.id as string).then((organization) => {
            setOrganization(organization)
        })
    }, [setOrganization]);

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        const invitation = await inviteUser(
            session.data,
            form.getValues("email"),
            "admin",
            await getIp(),
            {
                organizationId: params?.id as string,
                organizationName: organization?.name as string,
                organizationImage: organization?.image as string,
            }
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
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
    )
}