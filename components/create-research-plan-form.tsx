"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "./ui/form"
import {Input} from "./ui/input"
import {Textarea} from "./ui/textarea"
import {Button} from "./ui/button"
import {useSession} from "next-auth/react"
import { useRouter } from "next/navigation"
import { createRoadmap } from "@/lib/actions"

const editMilestoneForm = z.object({
    nodeType: z.string(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional()
})

export function CreateResearchPlanForm() {
    const router = useRouter()
    const {data: session} = useSession()

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description")
    }

    const handleFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        // if form state is not valid, don't submit

        if (!session?.user?.organizationId) {
            console.error(`No session data: no organization ID`)
            return
        }

        const roadmap =  await createRoadmap(session.user.organizationId, {
            title: values.title,
            description: values.description
        })
        if (roadmap && roadmap.id) {
            router.push(`/app/research-plan/${roadmap.id}`)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="flex flex-col gap-4 mt-2 px-1"
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel >{`Title`}</FormLabel>
                            <FormDescription>{`Enter a title for your Research Plan`}</FormDescription>
                            <FormControl>
                                <Input 
                                    id="title"
                                    placeholder="Enter a title..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel >{`Description`}</FormLabel>
                            <FormDescription>{`Enter a short description for your Research Plan.`}</FormDescription>
                            <FormControl>
                                <Textarea
                                    id="description"
                                    placeholder={`Enter a description...`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        // disabled={!form.formState.isValid}
                        type="submit"
                        variant={"cta"}
                        className="w-fit"
                        onClick={(e) => {
                            e.preventDefault()
                            handleFormSubmit(form.getValues())
                        }}
                    >
                        Create Research Plan
                    </Button>
                </div>

            </form>
        </Form>
    )
}
