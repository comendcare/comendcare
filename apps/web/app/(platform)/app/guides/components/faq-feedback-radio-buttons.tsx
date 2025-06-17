/* eslint-disable camelcase */
"use client"
import React from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { z } from "zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"

export type FeedbackTypes =
    | "innaccurate"
    | "incomplete"
    | "confusing"
    | "not-looking-for"
    | "other"

const FormSchema = z.object({
    type: z.enum(
        ["innaccurate", "incomplete", "confusing", "not-looking-for", "other"],
        {
            required_error:
                "Please select an issue. If none apply, please select 'other'."
        }
    )
})

export const feedbackTypeLabels = {
    "innaccurate": "It's inaccurate",
    "incomplete": "It's incomplete",
    "confusing": "It's confusing",
    "not-looking-for": "It's wasn't what I was looking for",
    "other": "Other"
}

export default function FAQFeedbackRadioButtons({
    feedbackCallback,
    cancelCallback
}: {
    feedbackCallback: (feedback: FeedbackTypes) => void
    cancelCallback: () => void
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    })

    function onSubmit(value: FeedbackTypes) {
        feedbackCallback(value)
    }

    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle>{`Thanks for letting us know!`}</CardTitle>
                        <CardDescription>{`We're sorry this article didn't answer your question. Please let us know how we can improve it.`}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-8">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                onSubmit(value as FeedbackTypes)
                                            }}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="innaccurate" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {feedbackTypeLabels["innaccurate"]}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="incomplete" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {feedbackTypeLabels["incomplete"]}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="confusing" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {feedbackTypeLabels["confusing"]}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="not-looking-for" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {feedbackTypeLabels["not-looking-for"]}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="other" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {feedbackTypeLabels["other"]}
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button variant={"outline"} onClick={cancelCallback}>
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
