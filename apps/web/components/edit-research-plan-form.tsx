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
import type {Prisma, Roadmap} from "@prisma/client"
import { JsonObject } from "@prisma/client/runtime/library"
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    editResearchPlanForm,
    MODALITIES,
    optionSchema,
    RESEARCH_PLAN_STATUS,
    RESEARCH_PLAN_TYPES,
    RESEARCH_STAGE,
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
import { revalidate } from "@comend/lib/revalidate"
import { Globe, Plus, Trash, User, Lock } from "lucide-react"
import { ScrollArea, ScrollBar } from "@comend/components/ui/scroll-area"
import { DialogFooter } from "@comend/components/ui/dialog"
import { PrivatePublicFormField } from "./edit-milestone-form"
import { RadioGroup, RadioGroupItem } from "@comend/components/ui/radio-group"
import { cn } from "@comend/lib/utils"
import { Tooltip, TooltipTrigger } from "@comend/components/ui/tooltip"
import { AnyARecord } from "dns"

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
    researchPlanData?: any
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
            isPrivate: researchPlanData?.private !== undefined && researchPlanData?.private !== null ? researchPlanData?.private : true,
            title: researchPlanData?.title || undefined,
            description: researchPlanData?.description || undefined,
            partners: researchPlanData?.partners || undefined,
            stages: RESEARCH_STAGE.filter((stage) => (researchPlanData?.stages ||[]).includes(stage.value)),
            statuses: RESEARCH_PLAN_STATUS.filter((status) => (researchPlanData?.statuses ||[]).includes(status.value)),
            links: researchPlanData?.links || undefined,
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
            await setDetails(values)
            if (closeDialog) closeDialog()
        } else {
            // Create new
            const roadmap = await createRoadmap(session.user.organizationId, {
                title: values.title,
                description: values.description || "",
                modalities: values?.modalities?.map((m) => m.value) || [],
                partners: values?.partners,
                stages: values?.stages?.map((m) => m.value) || [],
                statuses: values?.statuses?.map((m) => m.value) || [],
                links: values?.links,
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
            }, {userId: session?.user.id, userName: session?.user.name})

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
            <form 
                onSubmit={form.handleSubmit(handleFormSubmit)} 
                className="flex max-h-[80vh] flex-col overflow-hidden"
            >
                <ScrollArea type={"always"}>
                <ScrollBar />
                <div className="flex flex-col gap-4 pr-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormDescription>Name/type of drug for target</FormDescription>
                            <FormControl>
                                <Input id="title" placeholder="Enter a title..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem className="flex gap-6 items-center">
                    <div className="grow">
                        <FormLabel>{`Visibility`}</FormLabel>
                        <FormDescription>
                            {`Private research plans will not be shown to people outside of your organization.`}
                        </FormDescription>
                    </div>
                    <div className="w-[90px]">
                        <PrivatePublicFormField 
                            form={form} 
                            // formData={formData} 
                        />
                    </div>
                </FormItem>

                <FormField
                    control={form.control}
                    name="modalities"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Therapeutic strategy</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={RESEARCH_PLAN_TYPES}
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

                <FormField
                    control={form.control}
                    name="partners"
                    render={({field}) => (
                        <FormItem id="contacts">
                            <div className="flex gap-2 w-full justify-between items-center">
                                <div>
                                    <FormLabel>Partners</FormLabel>
                                    <FormDescription>{`Add any external contacts that are not on the Comend platform.`}</FormDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size={"icon"}
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault()
                                        form.setValue(
                                            "partners", 
                                            [
                                                ...(field?.value || []),
                                                {name: "", email: "", role: null}
                                            ],
                                            {shouldDirty: true}
                                        )
                                    }}
                                >
                                    <Plus/>
                                </Button>
                            </div>

                            {field?.value && field.value.length > 0 && (
                                <ol className="flex flex-col gap-4">
                                    {field.value.map((partner: any, index: number) => (
                                        <li key={index} className="grid grid-cols-[20px_auto_34px] lg:grid-cols-[20px_auto_auto_34px] gap-2 items-center">
                                            <User className="row-start-1 col-start-1 h-4 w-4"/>
                                            <div className="h-fit w-full grow row-start-1 col-start-2">
                                            <Input
                                                placeholder={`Name`}
                                                value={partner.name}
                                                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const newValue = {
                                                        ...partner,
                                                        name: e.currentTarget.value
                                                    }
                                                    form.setValue(
                                                        "partners",
                                                        field?.value?.map((currentValue: any, i: number) => i === index ? newValue : currentValue),
                                                        {shouldDirty: true}
                                                    )
                                                }}
                                            />
                                            </div>
                                            <div className="h-fit w-full grow row-start-2 col-start-2 lg:row-start-1 lg:col-start-3">
                                            <Input
                                                placeholder={`Email (required)`}
                                                value={partner.email}
                                                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const newValue = {
                                                        ...partner,
                                                        email: e.currentTarget.value
                                                    }
                                                    form.setValue(
                                                        "partners",
                                                        field?.value?.map((currentValue: any, i: number) => i === index ? newValue : currentValue),
                                                        {shouldDirty: true}
                                                    )
                                                }}
                                            />
                                            </div>
                                            <div className="h-fit w-full grow row-start-3 col-start-2 lg:row-start-2 lg:col-start-2 lg:col-span-2">
                                            <Input
                                                placeholder={`Affiliation`}
                                                value={partner.affiliation || undefined}
                                                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const newValue = {
                                                        ...partner,
                                                        affiliation: e.currentTarget.value
                                                    }
                                                    form.setValue(
                                                        "partners",
                                                        field?.value?.map((currentValue: any, i: number) => i === index ? newValue : currentValue),
                                                        {shouldDirty: true}
                                                    )
                                                }}
                                            />
                                            </div>
                                            <Button 
                                                type="button"
                                                className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                                variant="ghost" 
                                                onClick={() => {
                                                    form.setValue(
                                                        "partners",
                                                        field?.value?.filter((t: any, i: number) => i !== index),
                                                        {shouldDirty: true}
                                                    )
                                                }}
                                            >
                                                <Trash />
                                            </Button>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea id="description" placeholder={`Enter a description...`} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="stages"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stage</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={RESEARCH_STAGE}
                                    placeholder="Select a stage..."
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

                <FormField
                    control={form.control}
                    name="statuses"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={RESEARCH_PLAN_STATUS}
                                    placeholder="Select a status..."
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

                <FormField
                    control={form.control}
                    name="links"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormControl>
                                <>
                                    <div className="flex flex-row justify-between gap-2 items-center">
                                        <div>
                                            <FormLabel>{`Links`}</FormLabel>
                                            <FormDescription>{`Add any links that are not on the Comend platform.`}</FormDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            size={"icon"}
                                            variant="secondary"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                e.preventDefault()
                                                form.setValue(
                                                    "links", 
                                                    [
                                                        ...(field?.value || []),
                                                        {name: "", link: ""}
                                                    ],
                                                    {shouldDirty: true}
                                                )
                                            }}
                                        >
                                            <Plus/>
                                        </Button>
                                    </div>

                                    {field.value && field.value.length > 0 && (
                                        <ol className="flex flex-col gap-2">
                                            {field.value.map((paper: Prisma.ExternalAttachmentGetPayload<{}>, index: number) => (
                                                <li key={index} className="flex flex-row gap-2 items-center">
                                                    <div className="w-full grow">
                                                    <Input
                                                        placeholder={`Name`}
                                                        value={paper.name || ""}
                                                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                                            const newValue = {
                                                                ...paper,
                                                                name: e.currentTarget.value
                                                            }
                                                            form.setValue(
                                                                "links",
                                                                field?.value?.map((currentValue: any, i: number) => i === index ? newValue : currentValue),
                                                                {shouldDirty: true}
                                                            )
                                                        }}
                                                    />
                                                    </div>
                                                    <div className="w-full grow">
                                                    <Input
                                                        placeholder={`Url`}
                                                        value={paper.link}
                                                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                                                            const newValue = {
                                                                ...paper,
                                                                link: e.currentTarget.value
                                                            }
                                                            form.setValue(
                                                                "links",
                                                                field?.value?.map((currentValue: any, i: number) => i === index ? newValue : currentValue),
                                                                {shouldDirty: true}
                                                            )
                                                        }}
                                                    />
                                                    </div>
                                                    <Button 
                                                        className="h-full w-[34px]" 
                                                        variant="ghost" 
                                                        type="button"
                                                        onClick={() => {
                                                            form.setValue(
                                                                "links",
                                                                field?.value?.filter((t: any, i: number) => i !== index),
                                                                {shouldDirty: true}
                                                            )
                                                        }}
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                </div>
                </ScrollArea>

                <DialogFooter className="pt-4">
                    {researchPlanData?.id ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={!["owner", "support"].includes(session?.user?.membership?.role)}
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
                                                disabled={!["owner", "support"].includes(session?.user?.membership?.role)}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant={"destructive"}
                                                    onClick={async () => {
                                                        if (researchPlanData?.id) {
                                                            setIsLoading(true)
                                                            await deleteRoadmap(session?.user.organizationId, researchPlanData)
                                                            revalidate('/app/research-plan')
                                                            revalidate('/app/dashboard')
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
                            type="button"
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

                    <Button 
                        type="submit" 
                        variant={"cta"} 
                        className="w-fit"
                    >
                        {researchPlanData?.id ? `Save` : `Create research plan`}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
