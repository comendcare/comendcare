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
import {toggleOrganizationVerified} from "@/lib/actions"
import {Organization} from "@prisma/client";

const FormSchema = z.object({
    verified: z.boolean().default(false).optional(),
})

export function VerifyOrganizationSwitch({organization}: { organization: Organization }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            verified: organization?.verified,
        },
    })

    // Handle toggling the 'verified' state
    async function handleToggle() {
        // Call the toggleOrganizationVerified function with the organization
        try {
            const result = await toggleOrganizationVerified(organization.id)

            if (result && 'verified' in result) {
                // Update the form value to reflect the latest state
                form.setValue('verified', result.verified)

                toast(`Organization is now ${result.verified ? "verified" : "unverified"}`, {
                    description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                            <code className="text-white">
                                {JSON.stringify({verified: result.verified}, null, 2)}
                            </code>
                        </pre>
                    ),
                })
            } else {
                toast.error("Failed to update the organization verified status.")
            }
        } catch (error) {
            toast.error("Failed to update the organization verified status.")
        }
    }

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="verified"
                    render={({field}) => (
                        <FormItem>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={() => handleToggle()}
                                    />
                                </FormControl>
                                <FormLabel htmlFor="verified">
                                    Verified status
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
