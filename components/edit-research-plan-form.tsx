"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, { useState } from "react"
import {FormProvider, useForm} from "react-hook-form"
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
import { createRoadmap, deleteRoadmap } from "@/lib/actions"
import { Roadmap } from "@prisma/client"
import { ScrollArea } from "./ui/scroll-area"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { sleep } from "@/lib/utils"
import MultipleSelector from "./ui/multiple-selector"
import { ADDITIONAL_RESEARCH_PLAN_TYPES, MODALITIES, optionSchema, RESEARCH_PLAN_TYPES } from "@/lib/types"
import { mixpanelTrack } from "@/app/mixpanel"
import { JsonObject } from "@prisma/client/runtime/library"

const editResearchPlanForm = z.object({
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
    otherModalities: z.string().optional()
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

    const form = useForm<z.infer<typeof editResearchPlanForm>>({
        mode: "onChange",
        resolver: zodResolver(editResearchPlanForm),
        defaultValues: {
            title: researchPlanData?.title || undefined,
            description: researchPlanData?.description || undefined,
            modalities: RESEARCH_PLAN_TYPES.filter(modality => (researchPlanData?.modalities || []).includes(modality.value)),
            otherModalities: typeof researchPlanData?.metadata == 'object'? (researchPlanData?.metadata as { [key: string]: any })?.otherModalities : undefined,
        }
    })

    const handleFormSubmit = async (values: z.infer<typeof editResearchPlanForm>) => {
        if (!session?.user?.organizationId) {
            console.error(`No session data: no organization ID`)
            return
        }

        if (researchPlanData?.id) {
            // if the research plan already exists, just update it
            await setDetails({
                title: values.title,
                description: values.description || null,
                modalities: (values.modalities || []).map(modality => modality.value),
                metadata: {
                    ...(researchPlanData?.metadata ? JSON.parse(JSON.stringify(researchPlanData.metadata)) : undefined),
                    otherModalities: values.otherModalities
                } as JsonObject
            })

            if (closeDialog) closeDialog()
        } else {
            // if the research plan doesn't exist yet, create it
            const roadmap =  await createRoadmap(session.user.organizationId, {
                title: values.title,
                description: values.description || '',
                modalities: values?.modalities?.map(modality => modality.value) || [],
                milestones: [],
                id: "",
                content: null,
                slug: "",
                image: null,
                createdAt: "",
                updatedAt: "",
                published: false,
                organizationId: "",
                userId: null,
                nodes: [],
                edges: [],
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
                                    defaultOptions={
                                        MODALITIES.map(option => ({...option, type: 'Modality'})).concat(ADDITIONAL_RESEARCH_PLAN_TYPES.map(option => ({...option, type: "Non-Modality"})))
                                    }
                                    placeholder="Select a type..."
                                    hidePlaceholderWhenSelected={true}
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    maxSelected={1}
                                    showHoverCard={false}
                                    groupBy="type"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.watch("modalities")?.some((item) => item.value === "OTHER" || item.value === "OTHER_NON_MODALITY") && (
                    <FormField 
                        control={form.control}
                        name="otherModalities"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Additional Type Details`}</FormLabel>
                                <FormDescription>{`(Optional) Other details. This won't be displayed on your research plan, but will be used to improve the platform.`}</FormDescription>
                                <FormControl>
                                        <Input
                                            type="text"
                                            id="modalities-other"
                                            {...field}
                                        />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

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
                                                        await deleteRoadmap(session?.user.organizationId, researchPlanData.id, null)
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
                            variant={"secondary"}
                            className="w-fit"
                            onClick={(e) => {
                                e.preventDefault()
                                // reroute the user back to the research plans page
                                router.push('/app/research-plan')
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    
                    <Button
                        disabled={!form.formState.isValid}
                        type="submit"
                        variant={"cta"}
                        className="w-fit"
                    >
                        {researchPlanData?.id ? `Save` : `Create Research Plan`}
                    </Button>
                </div>

            </form>
        </Form>
    )
}
