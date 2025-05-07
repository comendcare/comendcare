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
import { createRoadmap, deleteRoadmap, updateRoadmap } from "@/lib/actions"
import { Roadmap } from "@prisma/client"
import { ScrollArea } from "./ui/scroll-area"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { sleep } from "@/lib/utils"
import MultipleSelector from "./ui/multiple-selector"
import { MODALITIES, optionSchema } from "@/lib/types"

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
        .optional(),
    modalities: z.array(optionSchema)
        .min(1, "Please select a type")
        .max(1, "You can only select one type")
        .optional(),
})

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    details: state.details,
    setDetails: state.setDetails
})

export function EditResearchPlanForm({researchPlanData, closeDialog}: {researchPlanData?: Partial<Roadmap>, closeDialog?: () => void}) {
    const router = useRouter()
    const {data: session} = useSession()
        const { 
            roadmapId,
            details,
            setDetails
        } = useRoadmapStore(useShallow(selector))

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: researchPlanData?.title || undefined,
            description: researchPlanData?.description || undefined,
            modalities: MODALITIES.filter(modality => (researchPlanData?.modalities || []).includes(modality.value))
        }
    })

    const handleFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        if (!session?.user?.organizationId) {
            console.error(`No session data: no organization ID`)
            return
        }

        if (researchPlanData?.id) {
            // if the research plan already exists, just update it
            await setDetails({
                title: values.title,
                description: values.description || null,
                modalities: (values.modalities || []).map(modality => modality.value)
            })
            if (closeDialog) closeDialog()
        } else {
            // if the research plan doesn't exist yet, create it
            const roadmap =  await createRoadmap(session.user.organizationId, {
                title: values.title,
                description: values.description || '',
                modalities: values.modalities || [],
                milestones: [],
            })

            if (roadmap && roadmap.id) {
                router.push(`/app/research-plan/${roadmap.id}`)
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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

                <FormField 
                    control={form.control}
                    name="modalities"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel >{`Type`}</FormLabel>
                            <FormDescription>{`Select a type that represents the goal of your research plan.`}</FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={MODALITIES}
                                    placeholder="Select a type..."
                                    hidePlaceholderWhenSelected={true}
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    maxSelected={1}
                                    showHoverCard={false}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 justify-end">
                    {researchPlanData?.id ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="destructive">
                                    Delete Research Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your Resarch Plan and it's data.`}
                                    </DialogDescription>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button type="button">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <DialogClose>
                                            <Button
                                                type="button"
                                                variant={"destructive"}
                                                onClick={async () => {
                                                    // delete research plan, and reroute the user back to the research plans page
                                                    if (researchPlanData?.id) {
                                                        await deleteRoadmap(new FormData(), researchPlanData.id, null)
                                                        router.push('/app/research-plan')
                                                        router.refresh()
                                                    }
                                                }}
                                            >
                                                Delete Research Plan
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button
                            type="submit"
                            variant={"secondary"}
                            className="w-fit"
                            onClick={() => {
                                // reroute the user back to the research plans page
                                router.push('/app/research-plan')
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    
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
        </Form>
    )
}
