"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

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