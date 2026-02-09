"use client"

import {PublicMarketplaceNav} from "@comend/components/marketplace/marketplace-nav"
import { TooltipProvider } from "@comend/components/ui/tooltip"
import { Separator } from "@comend/components/ui/separator"
import { Alert } from "@comend/components/ui/alert"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@comend/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@comend/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Input } from "@comend/components/ui/input"
import { Button } from "@comend/components/ui/button"
import { useEffect, useState } from "react"
import LoadingDots from "@comend/components/icons/loading-dots"
import { sleep } from "@comend/lib/utils"

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

interface ProjectLayoutProps {
    children: React.ReactNode
}

const emailCaptureFormSchema = z.object({
    email: z.string({required_error: "Email is required"}).email({message: "Invalid email format"}) // Custom error message is optional
})

export default function ProjectLayout({children}: ProjectLayoutProps) {
    const [loading, setLoading] = useState(false)
    const [emailCaptureOpen, setEmailCaptureOpen] = useState(false)

    const form = useForm({
        mode: "onSubmit",
        resolver: zodResolver(emailCaptureFormSchema),
    })

    useEffect(() => {
        const value =
            !window.functionalConsentedLocalStorage?.get('emailCaptured')

        setEmailCaptureOpen(Boolean(value))
    }, [])


    // Zustand state management
    return (
        <TooltipProvider>
            {/* {(typeof window !== undefined && window?.functionalConsentedLocalStorage?.get('emailCapture')) ? (
                <></>
            ) : ( */}
                <AlertDialog open={emailCaptureOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Accessing Comend's public marketplace?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Please provide your email address to access Comend's public marketplace content.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Form {...form}>
                    <form className="flex flex-col gap-4 justify-end items-end">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            variant="cta"
                            onClick={async (e) => {
                                if (!form.formState.isValid) {
                                    form.trigger()
                                    return
                                }

                                e.preventDefault()
                                setLoading(true)

                                await sleep(2000)

                                // TODO: add email capture logic here...

                                setLoading(false)
                                setEmailCaptureOpen(false)
                            }}
                            className="w-fit"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingDots color="#000000" />
                            ): (
                                <p>{`Submit`}</p>
                            )}
                        </Button>
                    </form>
                </Form>
                </AlertDialogContent>
                </AlertDialog>
            {/* )} */}
            <div className="w-full flex justify-center">
                <div className="max-w-7xl mt-16 lg:mt-28 h-full w-full flex flex-col items-center p-4 gap-4 md:gap-6">
                    <div className="flex w-full flex-col gap-4">
                        <h1 className="text-3xl md:text-4xl font-semibold">Explore Comend</h1>
                    </div>
                    <Separator />
                    <PublicMarketplaceNav />
                    {children}
                </div>
            </div>
        </TooltipProvider>
    )
}
