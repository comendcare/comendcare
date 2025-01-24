/* eslint-disable camelcase */
"use client"
import React from "react"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FaCircleInfo, FaComment } from "react-icons/fa6"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
// import { customerIOTrack, sendCustomerIOFeedbackEmail } from "@/lib/customer-io"
import { useMixpanelContext } from "@/app/mixpanel"
import { uploadFeedbackImg } from "@/lib/g-cloud"
import { createFeedbackTicket } from "@/lib/notion"

async function getBase64(file: File) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        fileReader.onload = () => {
            // this removed the type prefix from the result (e.g. data:img/png:base64 would be removed)
            resolve(fileReader.result?.toString().split(",")[1])
        }

        fileReader.onerror = error => {
            reject(error)
        }
    })
}

const feedbackFormSchema = z.object({
    description: z
        .string({
            required_error: "Please provide a message describing your feedback."
        })
        .min(1, "Description is required"),
    images: z.custom<FileList>().optional(),
    name: z
        .string({ required_error: "Name is required" })
        .min(1, "Name is required"),
    email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email format" })
})

interface FeedbackProps {
    className?: string
}

export const FeedbackForm: React.FC<FeedbackProps> = () => {
    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(feedbackFormSchema)
    })
    const { mixpanelContext } = useMixpanelContext()

    const handleSubmitClick = async (data: any) => {
        try {
            // let attachments = []
            let urls = []
            
            for (let i = 0; i < data.images.length; i++) {
                // attachments.push({
                //     filename: data.images[i].name,
                //     content: await getBase64(data.images[i])
                // })
                const url = await handleImageUpload(data.images[i])
                if (url) urls.push(url)
            }

            // edit this for testing purposes, if you want to test sending this to a different email address
            // const toEmail = 'support@comendcare.com'
            // const emailPayload = {
            //     transactional_message_id: '2',
            //     to: toEmail,
            //     identifiers: { 
            //         id: mixpanelContext?.distinctId
            //     },
            //     message_data: {
            //         subject: 'Feedback Form Submitted',
            //         body: {
            //             name: data.name,
            //             email: data.email,
            //             description: data.description
            //         },
            //     }
            // }
            // await sendCustomerIOFeedbackEmail(emailPayload, attachments)

            // await customerIOTrack({
            //     userId: mixpanelContext?.distinctId,
            //     event: 'feedback_submitted',
            //     properties: {
            //         name: data.name,
            //         email: data.email,
            //         description: data.description,
            //         photo_included: attachments.length > 0
            //     }
            // })

            await createFeedbackTicket({
                name: data.name,
                email: data.email,
                feedback: data.description,
                imgUrls: urls
            })

            toast(`Success!`, {
                description: `Thank you for your feedback!`
            })
        } catch (e) {
            console.error(`Error submitting feedback form: `, e)

            toast(`Error!`, {
                description: `Something went wrong. Please try again later or email us at contact@comendcare.com.`
            })
        }

        // reset form state
        form.reset()
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <FaComment />
                    <span>Submit feedback</span>
                </Button>
            </SheetTrigger>
            <SheetContent onOpenAutoFocus={event => event.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Send Feedback</SheetTitle>
                </SheetHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmitClick)}
                        className="grid gap-8 py-4"
                    >
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
                                                        <FaCircleInfo className="inline" />
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

                        <FormField
                            control={form.control}
                            name="images"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        Add a Screenshot (optional)
                                    </FormLabel>
                                    <FormDescription>{`Including a screenshot will help us better understand your feedback.`}</FormDescription>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            {...form.register("images")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <SheetFooter>
                            <SheetClose asChild>
                                <Button
                                    type="submit"
                                    disabled={!form.formState.isValid}
                                >
                                    Submit Feedback
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}

async function handleImageUpload(file: File): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onloadend = async () => {
            const base64data = reader.result
                ?.toString()
                .replace(/^data:image\/\w+;base64,/, "")

            const imageUrl = await uploadFeedbackImg({
                name: file.name,
                type: file.type,
                data: base64data || ""
            })

            resolve(imageUrl)
        }

        reader.onerror = error => {
            reject(error)
        }
    })
}