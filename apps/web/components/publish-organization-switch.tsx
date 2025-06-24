"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {toast} from "sonner"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import {Switch} from "@/components/ui/switch"
import {toggleOrganizationPublished} from "@/lib/actions"
import {Organization} from "@prisma/client";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import React from "react";
import { Info } from "lucide-react"

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
        <TooltipProvider>
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
                                            className="data-[state=checked]:bg-blue-dark data-[state=unchecked]:bg-blue-light"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="published" className="inline-flex items-center gap-1">
                                        {field.value ? "Published" : "Unpublished"}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4"/>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-80 text-wrap text-left">
                                                {`Published profiles are viewable to visitors and users via your public URL and in our marketplace.`}
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </TooltipProvider>
    )
}
