"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {toast} from "sonner"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@comend/components/ui/form"
import {Switch} from "@comend/components/ui/switch"
import {toggleBiopharmaConsentSettings} from "@comend/lib/actions"
import {Organization} from "@prisma/client";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import React from "react";
import { Info } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/packages/lib/utils"

const FormSchema = z.object({
    biopharmaConsentSettings: z.boolean().default(false).optional(),
})

export function BiopharmaConsentSwitch({organization}: { organization: Organization }) {
    const {data: session} = useSession()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            biopharmaConsentSettings: organization?.biopharmaConsentSettings,
        },
    })

    async function handleToggle() {
        try {
            const result = await toggleBiopharmaConsentSettings(organization.id)

            if (result && 'biopharmaConsentSettings' in result) {
                form.setValue('biopharmaConsentSettings', result.biopharmaConsentSettings)
                toast.success(`Biopharma consent is now ${result.biopharmaConsentSettings ? "enabled" : "disabled"}`)
            } else {
                toast.error("Failed to update the biopharma consent settings.")
            }
        } catch (error) {
            toast.error("Failed to update the biopharma consent settings.")
        }
    }

    return (
        <TooltipProvider>
            <Form {...form}>
                <form>
                    <FormField
                        control={form.control}
                        name="biopharmaConsentSettings"
                        render={({field}) => (
                            <FormItem>
                            <Tooltip>
                                <TooltipTrigger onClick={(e) => e.preventDefault()} className={cn(session?.user?.membership?.role !== "owner" ? "opacity-50" : "")}>
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={() => handleToggle()}
                                            className="data-[state=checked]:bg-blue-dark data-[state=unchecked]:bg-blue-light"
                                            disabled={session?.user?.membership?.role !== "owner"}
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="biopharmaConsentSettings" className="inline-flex items-center gap-1">
                                        {field.value ? "Biopharma consented" : "Biopharma not consented"}
                                        {session?.user?.membership?.role === "owner" && (
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <Info className="h-4 w-4"/>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-80 text-wrap text-left">
                                                    {`Enabling this setting enables us to connect you with biopharma partners based on your profile.`}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </FormLabel>
                                </div>
                                </TooltipTrigger>
                                {session?.user?.membership?.role !== "owner" && (
                                    <TooltipContent className="max-w-80">
                                        <p>Profile editing is only enabled for organization owners. Please contact the owners of your organization. Owners are visible in the Organization Settings tab in the memberships section.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </TooltipProvider>
    )
}
