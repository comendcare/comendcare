import React from "react"
import { useState } from "react"
import Image from "next/image"
import logo from "@/public/Full logo.png"
import { Button } from "@comend/components/ui/button"
import Spinner from "@comend/components/ui/spinner"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FormProvider, useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@comend/components/ui/form"
import { Input } from "@comend/components/ui/input"
import { Textarea } from "@comend/components/ui/textarea"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { createRoadmap, deleteRoadmap } from "@comend/lib/actions"
import { Roadmap } from "@prisma/client"
import { JsonObject } from "@prisma/client/runtime/library"
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    ADDITIONAL_RESEARCH_PLAN_TYPES,
    MODALITIES,
    optionSchema,
    RESEARCH_PLAN_TYPES,
} from "@comend/lib/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@comend/components/ui/alert-dialog"

const editResearchPlanForm = z.object({
    title: z
        .string({ required_error: "Please provide a title" })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    modalities: z.array(optionSchema).max(1, "You can only select one type").optional(),
    otherModalities: z.string().optional(),
})

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    details: state.details,
    setDetails: state.setDetails,
})

export function EditResearchPlanForm({
                                         researchPlanData,
                                         closeDialog,
                                         setIsSubmitting,
                                     }: {
    researchPlanData?: Partial<Roadmap>
    closeDialog?: () => void
    setIsSubmitting?: (submitting: boolean) => void
}) {
    const router = useRouter()
    const { data: session } = useSession()
    const { roadmapId, details, setDetails } = useRoadmapStore(useShallow(selector))
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof editResearchPlanForm>>({
        mode: "onChange",
        resolver: zodResolver(editResearchPlanForm),
        defaultValues: {
            title: researchPlanData?.title || undefined,
            description: researchPlanData?.description || undefined,
            modalities: RESEARCH_PLAN_TYPES.filter((modality) =>
                (researchPlanData?.modalities || []).includes(modality.value)
            ),
            otherModalities:
                typeof researchPlanData?.metadata == "object"
                    ? (researchPlanData?.metadata as { [key: string]: any })?.otherModalities
                    : undefined,
        },
    })

    const handleFormSubmit = async (values: z.infer<typeof editResearchPlanForm>) => {
        setIsLoading(true)
        if (setIsSubmitting) setIsSubmitting(true)
        if (!session?.user?.organizationId) {
            console.error(`No session data: no organization ID`)
            return
        }

        if (researchPlanData?.id) {
            // Update existing
            await setDetails({
                title: values.title,
                description: values.description || null,
                modalities: (values.modalities || []).map((m) => m.value),
                metadata: {
                    ...(researchPlanData?.metadata
                        ? JSON.parse(JSON.stringify(researchPlanData.metadata))
                        : undefined),
                    otherModalities: values.otherModalities,
                } as JsonObject,
            })

            if (closeDialog) closeDialog()
        } else {
            // Create new
            const roadmap = await createRoadmap(session.user.organizationId, {
                title: values.title,
                description: values.description || "",
                modalities: values?.modalities?.map((m) => m.value) || [],
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
                metadata: {
                    ...(researchPlanData?.metadata
                        ? JSON.parse(JSON.stringify(researchPlanData.metadata))
                        : undefined),
                    otherModalities: values.otherModalities,
                } as JsonObject,
            })

            if (roadmap && roadmap.id) {
                router.push(`/app/research-plan/${roadmap.id}`)
            }
        }
    }

    if (isLoading)
        return (
            <div className="h-full w-full flex flex-col space-y-8 items-center justify-center">
                <Spinner className="scale-150" />
                <div className="w-1/6 min-w-40">
                    <Image priority src={logo} alt="Comend logo" />
                </div>
            </div>
        )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormDescription>Enter a title for your Research Plan</FormDescription>
                            <FormControl>
                                <Input id="title" placeholder="Enter a title..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormDescription>
                                Enter a short description for your Research Plan.
                            </FormDescription>
                            <FormControl>
                                <Textarea id="description" placeholder={`Enter a description...`} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="modalities"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormDescription>
                                Select a type that represents the goal of your research plan.
                            </FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={
                                        MODALITIES.map((o) => ({ ...o, type: "Modality" })).concat(
                                            ADDITIONAL_RESEARCH_PLAN_TYPES.map((o) => ({ ...o, type: "Non-Modality" }))
                                        )
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

                {form.watch("modalities")?.some(
                    (item) => item.value === "OTHER" || item.value === "OTHER_NON_MODALITY"
                ) && (
                    <FormField
                        control={form.control}
                        name="otherModalities"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Type Details</FormLabel>
                                <FormDescription>
                                    {`(Optional) Other details. This won't be displayed on your research plan, but will be used to improve the platform.`}
                                </FormDescription>
                                <FormControl>
                                    <Input type="text" id="modalities-other" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex gap-2 justify-end">
                    {researchPlanData?.id ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={session?.user?.membership?.role !== "owner"}
                                >
                                    Delete Research Plan
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                {isLoading ? (
                                    <div className="flex flex-col space-y-8 py-8 items-center justify-center">
                                        <Spinner className="scale-150" />
                                        <div className="w-1/6 min-w-40">
                                            <Image priority src={logo} alt="Comend logo" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your Research Plan and its data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                asChild
                                                disabled={session?.user?.membership?.role !== "owner"}
                                            >
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        if (researchPlanData?.id) {
                                                            setIsLoading(true)
                                                            await deleteRoadmap(session?.user.organizationId, researchPlanData)
                                                            // After deletion, navigate away
                                                            router.push("/app/research-plan")
                                                        }
                                                    }}
                                                >
                                                    Delete Research Plan
                                                </Button>
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </>
                                )}
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button
                            variant={"secondary"}
                            className="w-fit"
                            onClick={(e) => {
                                e.preventDefault()
                                // Reroute the user back to the research plans page
                                router.push("/app/research-plan")
                            }}
                        >
                            Cancel
                        </Button>
                    )}

                    <Button disabled={!form.formState.isValid} type="submit" variant={"cta"} className="w-fit">
                        {researchPlanData?.id ? `Save` : `Create Research Plan`}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
