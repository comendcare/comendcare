"use client"
import {Label} from "@/components/ui/label";
import {FancyInput} from "@/components/ui/fancy-input";
import {LabelInputContainer} from "@/components/contact-form";
import {RainbowSubscribeButton} from "@/components/ui/rainbow-subscribe-button";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { sendBetaSignupEmail } from "@/lib/emails";
import { useEffect, useState } from "react";

const betaSignupFormSchema = z.object({
    name: z
        .string({
            required_error: "Please provide a name."
        })
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    email: z
        .string({
            required_error: "Email is required"
        })
        .email({ message: "Invalid email format" }),
})

export function BetaSignup({ isSubscribed, isSubscribedCallback, inline = false }: { isSubscribed: boolean, isSubscribedCallback: () => Promise<void>, inline?: boolean }) {
    const form = useForm<z.infer<typeof betaSignupFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(betaSignupFormSchema)
    })

    const name = form.watch("name")
    const email = form.watch("email")

    const handleBetaSignupSubmit = async () => {
        console.log(`handle beta signup!`)
        try {
            // send beta signup email
            await sendBetaSignupEmail({
                user: {
                    name,
                    email
                }
            })

            console.log("Form submitted, email sent")
            isSubscribedCallback()
        } catch (e) {
            console.error(`Erroor submitting beta signup form: `, e)
        }
    }

    return (
        <>
            {!inline && !isSubscribed && <Label className="text-base">
                🎉&nbsp;&nbsp;Join our beta testing community
            </Label>}
            {!inline && isSubscribed && <Label className="text-base">
                Thank you for joining!
            </Label>}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleBetaSignupSubmit)}>
                {!isSubscribed && <div className={`w-full flex ${inline ? "flex-col" : "flex-col md:flex-row md:space-y-0 md:space-x-2"} space-y-2 mb-4`}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex flex-col grow">
                                <FormControl>
                                    <LabelInputContainer>
                                        <FancyInput id="name" placeholder="Name" type="text" {...field} />
                                    </LabelInputContainer>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex flex-col grow">
                                <FormControl>
                                    <LabelInputContainer>
                                        <FancyInput id="email" placeholder="Email" type="email" {...field} />
                                    </LabelInputContainer>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>}

                <RainbowSubscribeButton
                    subscribeStatus={isSubscribed}
                    initialText="Join"
                    changeText="Joined"
                    buttonTextColor="white"
                />
                </form>
            </Form>
        </>
    )
}