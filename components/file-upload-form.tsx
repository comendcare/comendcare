/* eslint-disable camelcase */
"use client"
import React from "react"
import {
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FaCircleInfo } from "react-icons/fa6"
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMixpanelContext} from "@/app/mixpanel";
import {createFeedbackTicket} from "@/lib/notion";
import {toast} from "sonner";
import {z} from "zod";
import {uploadFeedbackImg} from "@/lib/g-cloud";

const feedbackFormSchema = z.object({
    file: z.any()
})

export function FileUploadForm({accept}: {accept: string}) {
    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(feedbackFormSchema)
    })

    const handleSubmitClick = async (data: any) => {
        console.log(`UPLOAD FILE`, data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmitClick)}
                className="flex flex-col gap-8 py-4"
            >
                <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>
                                Upload file
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept={accept}
                                    {...form.register("file")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    variant={"cta"}
                    className="w-fit self-end"
                    type="submit"
                    disabled={!form.formState.isValid}
                >
                    Upload
                </Button>
            </form>
        </Form>
    )
}