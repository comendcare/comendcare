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
import { Roadmap } from "@prisma/client"
import { ScrollArea } from "./ui/scroll-area"

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

export function EditResearchPlanForm({researchPlanData}: {researchPlanData?: Partial<Roadmap>}) {
    const router = useRouter()
    const {data: session} = useSession()

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: researchPlanData?.title || undefined,
            description: researchPlanData?.description || undefined
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description")
    }

    const handleFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        if (!session?.user?.organizationId) {
            console.error(`No session data: no organization ID`)
            return
        }

        if (researchPlanData?.id) {
            // if the research plan already exists, just update it
            
        } else {
            // if the research plan doesn't exist yet, create it
            const roadmap =  await createRoadmap(session.user.organizationId, {
                title: values.title,
                description: values.description
            })

            if (roadmap && roadmap.id) {
                router.push(`/app/research-plan/${roadmap.id}`)
            }
        }
    }

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 w-full"} type={"always"}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="w-full max-w-xl flex flex-col gap-4 mt-2 px-1"
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
                        {researchPlanData?.id ? `Save` : `Create Research Plan`}
                    </Button>
                </div>

            </form>
            </ScrollArea>
        </Form>
    )
}
