"use client"

import React, {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Dialog, DialogClose, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {DeleteTaskDialogContent} from "@/components/delete-task-dialog-content";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import {Input} from "@/components/ui/input";
import {getMembers} from "@/lib/fetchers";
import {Textarea} from "@/components/ui/textarea";
import {createReview} from "@/lib/actions";
import { Company } from "@prisma/client";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";


export default function CROReviewForm({cro}: {cro: Company}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Track loading state for actions

    const reviewForm = z.object({
        title: z
            .string({
                required_error: "Please provide a title"
            })
            .min(1, "Title is required")
            .max(100, "Title must be less than 100 characters"),
        body: z
            .string({
                required_error: "Please provide a description"
            })
            .min(1, "Description is required")
            .max(500, "Description must be less than 500 characters"),
    })

    const form = useForm<z.infer<typeof reviewForm>>({
        mode: "onChange",
        resolver: zodResolver(reviewForm),
        defaultValues: {
            title: "",
            body: "",
        }
    })

    const handleFormSubmit = async (values: z.infer<typeof reviewForm>) => {
        setLoading(true)
        console.log(values)
        try {
            const formData = new FormData()

            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            createReview(cro.id, formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error)
                } else {
                    va.track("Created review")

                    // Update the session object with the newly created organizationId
                    router.refresh()
                    toast.success(`Successfully published review!`)
                }
            })
        } catch (error) {
            toast.error("An error occurred while creating your organization.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="flex flex-col gap-2 p-4 pt-0"
            >

                <FormField
                    control={form.control}
                    name="title"
                    render={({field}) => (
                        <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                            <FormLabel className="text-md mt-2">{`Title`}</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-10"
                                    id="title"
                                    placeholder={`Enter a title`}
                                    defaultValue={field.value}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="body"
                    render={({field}) => (
                        <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                            <FormLabel className="text-md mt-2">{`Description`}</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="h-10"
                                    id="body"
                                    placeholder={`Enter a description`}
                                    defaultValue={field.value}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit">
                    Submit review
                </Button>
            </form>
        </Form>
    )
}
