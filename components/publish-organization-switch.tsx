"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {toast} from "sonner"
import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import {Switch} from "@/components/ui/switch"
import {toggleOrganizationPublished} from "@/lib/actions"
import {Organization} from "@prisma/client";

const FormSchema = z.object({
    published: z.boolean().default(false).optional(),
})

export function PublishOrganizationSwitch({organization}: { organization: Organization }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            published: organization?.published,
        },
    })

    // Handle toggling the 'published' state
    async function handleToggle() {
        // Call the published function with the organization
        try {
            const result = await toggleOrganizationPublished(organization.id)
            console.log("test")
            console.log(result)

            if (result && 'published' in result) {
                // Update the form value to reflect the latest state
                form.setValue('published', result.published)

                toast.success(`Organization is now ${result.published ? "published" : "unpublished"}`)
            } else {
                toast.error("Failed to update the organization published status.")
            }
        } catch (error) {
            toast.error("Failed to update the organization published status.")
        }
    }

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="published"
                    render={({field}) => (
                        <FormItem>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={() => handleToggle()}
                                    />
                                </FormControl>
                                <FormLabel htmlFor="published">
                                    {field.value ? "Published" : "Unpublished"}
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
