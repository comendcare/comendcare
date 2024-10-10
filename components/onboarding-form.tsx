"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createOrGetSite} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";

const invitationFormSchema = z.object({
    name: z.string().min(2, {
        message: "Your name must be at least 2 characters.",
    }),
    orgName: z.string().min(2, {
        message: "Your organization's name must be at least 2 characters.",
    }),
    slug: z.string().min(2, {
        message: "Your organization's slug must be at least 2 characters.",
    }),
    description: z.string().min(2, {
        message: "Your organization's description.",
    }),
})

export default function OnboardingForm() {
    const session = useSession();

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        console.log(values)
        const createOrg = await createOrGetSite({
                siteName: form.getValues("orgName"),
                siteSlug: form.getValues("slug")
            },
            session.data?.user.id,
            form.getValues("description")
        )

        console.log(createOrg)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Spongebob Squarepants" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="orgName"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Organization name`}</FormLabel>
                            <FormDescription>{`The name of your organization`}</FormDescription>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="name"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slug"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Nickname`}</FormLabel>
                            <FormDescription>{`The abbreviated, short form, or nickname for your organization.`}</FormDescription>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="name"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                You can <span>@mention</span> other users and organizations.
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