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
import {toggleBiopharmaConsentSettings} from "@/lib/actions"
import {Organization} from "@prisma/client";
import {TooltipProvider, Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import React from "react";
import { Info } from "lucide-react"

const FormSchema = z.object({
    biopharmaConsentSettings: z.boolean().default(false).optional(),
})

export function BiopharmaConsentSwitch({organization}: { organization: Organization }) {
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
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={() => handleToggle()}
                                            className="data-[state=checked]:bg-blue-dark data-[state=unchecked]:bg-blue-light"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="biopharmaConsentSettings" className="inline-flex items-center gap-1">
                                        {field.value ? "Biopharma consented" : "Biopharma not consented"}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4"/>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-80 text-wrap text-left">
                                                {`Enabling this setting enables us to connect you with biopharma partners based on your profile.`}
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
