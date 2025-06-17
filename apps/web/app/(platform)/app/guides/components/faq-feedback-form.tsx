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
import { z } from "zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { feedbackTypeLabels, FeedbackTypes } from "./faq-feedback-radio-buttons"
import { Info } from "lucide-react"

const FormSchema = z.object({
    description: z
        .string({
            required_error: "Please provide a message describing your feedback."
        })
        .min(1, "Description is required"),
    name: z
        .string({ required_error: "Name is required" })
        .min(1, "Name is required"),
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email format" })
})

export default function FAQFeedbackForm({
    issueType,
    feedbackCallback,
    cancelCallback
}: {
    issueType: string,
    feedbackCallback: (name: string, email: string, description: string) => void
    cancelCallback: () => void
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        feedbackCallback(data.name, data.email, data.description)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {`We'll need some more information to fix your issue.`}
                        </CardTitle>
                        <CardDescription>
                            {`Please send us your name, email address, and a short description of your problem, and we'll get back to you.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-lg font-semibold leading-none tracking-tight rounded-lg border bg-card text-card-foreground shadow-sm p-4">{`Issue: ${feedbackTypeLabels[issueType as FeedbackTypes]}`}</p>

                        <FormField
                            control={form.control}
                            name="name"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="name"
                                            placeholder="Your name here..."
                                            type="text"
                                            {...form.register("name")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            placeholder="Your email here..."
                                            type="text"
                                            {...form.register("email")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormDescription>
                                        {`Please don't include sensitive information. `}
                                        <TooltipProvider delayDuration={50}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="p-0 h-auto"
                                                        variant="ghost"
                                                    >
                                                        <Info className="inline" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-64">
                                                    <p>{`Sensitive information includes any information that should be protected. For example, don't include passwords, credit card information, or personal details.`}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </FormDescription>
                                    <FormControl>
                                        <Textarea
                                            id="description"
                                            placeholder="Please write your feedback here..."
                                            {...form.register("description")}
                                        />
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
                        <Button type="submit">Submit</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
