"use client"
import { Label } from "@/components/ui/label"
import { FancyInput } from "@/components/ui/fancy-input"
import { LabelInputContainer } from "@/components/contact-form"
import { RainbowSubscribeButton } from "@/components/ui/rainbow-subscribe-button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { sendBetaSignupEmail } from "@/lib/emails"
import mixpanel from "mixpanel-browser"
import { customerIOTrack } from "@/lib/customer-io"

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
        .email({ message: "Invalid email format" })
})

export function BetaSignup({
    isSubscribed,
    isSubscribedCallback,
    inline = false
}: {
    isSubscribed: boolean
    isSubscribedCallback: () => Promise<void>
    inline?: boolean
}) {
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

            mixpanel.track(`Beta signup`, {
                name: name,
                email: email
            })

            await customerIOTrack({
                userId: email || undefined,
                event: 'beta_signup',
                properties: {
                    name: name,
                    email: email
                }
            })

            console.log("Form submitted, email sent")
            isSubscribedCallback()
        } catch (e) {
            console.error(`Erroor submitting beta signup form: `, e)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center space-y-2">
            {!inline && !isSubscribed && <Label className="text-xl">
                🎉&nbsp;&nbsp;Book a demo
            </Label>}
            {!inline && isSubscribed && <Label className="text-base">
                Thank you for joining!
            </Label>}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleBetaSignupSubmit)}
                    className="flex flex-row justify-center items-center space-x-2"
                >
                    {!isSubscribed && (
                        <div
                            className={`w-full flex items-center ${inline ? "items-center flex-row" : "items-center flex-row"}`}
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col grow">
                                        <FormControl>
                                            <LabelInputContainer>
                                                <FancyInput
                                                    id="name"
                                                    placeholder="Name"
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col grow">
                                        <FormControl>
                                            <LabelInputContainer>
                                                <FancyInput
                                                    id="email"
                                                    placeholder="Email"
                                                    type="email"
                                                    {...field}
                                                />
                                            </LabelInputContainer>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <RainbowSubscribeButton
                        subscribeStatus={isSubscribed}
                        initialText="Join"
                        changeText="Joined"
                        buttonTextColor="white"
                    />
                </form>
            </Form>
        </div>
    )
}
