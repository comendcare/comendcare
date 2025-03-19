"use client"
import React from "react"
import { Label } from "@/components/ui/label"
import { FancyInput } from "@/components/ui/fancy-input"
import { cn } from "@/lib/utils"
import { FancyTextarea } from "@/components/ui/fancy-textarea"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { sendContactEmail } from "@/lib/emails"
import { useRouter } from "next/navigation"

const contactFormSchema = z.object({
    firstName: z
        .string({
            required_error: "Please provide a first name."
        })
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters"),
    lastName: z
        .string({
            required_error: "Please provide a last name."
        })
        .min(1, "Last name is required")
        .max(100, "Last name must be less than 100 characters"),
    email: z
        .string({
            required_error: "Email is required"
        })
        .email({ message: "Invalid email format" }),
    message: z
        .string({
            required_error: "Please write a message."
        })
        .min(1, "Message is required")
})

export function SimpleContactForm() {
    const router = useRouter()
    const form = useForm<z.infer<typeof contactFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(contactFormSchema)
    })

    const firstName = form.watch("firstName")
    const lastName = form.watch("lastName")
    const email = form.watch("email")
    const message = form.watch("message")

    const handleContactSubmit = async () => {
        try {
            await sendContactEmail({
                user: {
                    name: `${firstName} ${lastName}`,
                    email: email
                },
                message: message
            })

            console.log("Form submitted")
            router.push("/contact/thank-you")
        } catch (e) {
            console.error(`Error submitting contact form:`, e)
        }
    }

    return (
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
            <Form {...form}>
                <form
                    className=""
                    onSubmit={form.handleSubmit(handleContactSubmit)}
                >
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col grow">
                                    <FormControl>
                                        <LabelInputContainer>
                                            <Label htmlFor="firstname">
                                                First name
                                            </Label>
                                            <FancyInput
                                                id="firstname"
                                                placeholder="Spongebob"
                                                type="text"
                                                {...field}
                                            />
                                        </LabelInputContainer>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col grow">
                                    <FormControl>
                                        <LabelInputContainer>
                                            <Label htmlFor="lastname">
                                                Last name
                                            </Label>
                                            <FancyInput
                                                id="lastname"
                                                placeholder="Squarepants"
                                                type="text"
                                                {...field}
                                            />
                                        </LabelInputContainer>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex flex-col mb-4">
                                <FormControl>
                                    <LabelInputContainer>
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <FancyInput
                                            id="email"
                                            placeholder="spongebob.squarepants@gmail.com"
                                            type="email"
                                            {...field}
                                        />
                                    </LabelInputContainer>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem className="flex flex-col mb-4">
                                <FormControl>
                                    <LabelInputContainer>
                                        <Label htmlFor="message">
                                            How can we help?
                                        </Label>
                                        <FancyTextarea
                                            id="message"
                                            {...field}
                                        />
                                    </LabelInputContainer>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <button
                        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit"
                    >
                        Get in touch &rarr;
                        <BottomGradient />
                    </button>
                </form>
            </Form>
        </div>
    )
}

export const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    )
}

export const LabelInputContainer = ({
    children,
    className
}: {
    children: React.ReactNode
    className?: string
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    )
}
