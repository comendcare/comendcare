"use client"

import {useShallow} from "zustand/react/shallow"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {useForm} from "react-hook-form"
import {DoubleSliderBarChart} from "./ui/slider-double"
import {ScrollArea} from "./ui/scroll-area"
import {Button} from "./ui/button"
import MultipleSelector from "./ui/multiple-selector"
import {ASSOCIATED_CATEGORIES, BUSINESS_TYPES, CRO_CERTIFICATIONS} from "@/lib/types"
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group"
import {defaultFilters, CROSearchState, useCROSearchStore} from "@/state/search/croSearchStore";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import {useEffect} from "react"
import {Info} from "lucide-react"
import {useQueryState} from "nuqs"
import {MILESTONE_TYPE_OPTIONS} from "@/prisma/seed/seed-options";
import { badgeVariants } from "./ui/badge"

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map(option => ({
    ...option,
    value: option.id,
}));

const selector = (state: CROSearchState) => ({
    filters: state.filters,
    allResults: state.allResults,
    setFilters: state.setFilters
})

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const filtersFormSchema = z.object({
    categories: z.array(optionSchema),
    milestoneTypes: z.array(optionSchema),
    types: z.array(optionSchema),
    certifications: z.array(optionSchema),
})

export function CROFilters() {
    const {filters, allResults, setFilters} = useCROSearchStore(useShallow(selector))
    // For URL sync
    const [queryMilestoneTypes, setQueryMilestoneTypes] = useQueryState("milestoneTypes", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryCategories, setQueryCategories] = useQueryState("categories", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryTypes, setQueryTypes] = useQueryState("types", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryCertifications, setQueryCertifications] = useQueryState("certifications", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    // Utility: Convert query string -> {label, value}[]
    const parseQuery = (str: string | null) =>
        str?.split(",").filter(Boolean).map((value) => ({label: value, value})) || []
    const form = useForm<z.infer<typeof filtersFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(filtersFormSchema),
        defaultValues: filters
    })

    const handleSubmit = async (values: z.infer<typeof filtersFormSchema>) => {
        setFilters(values)

        const stringify = (arr: { value: string }[]) => arr.map(x => x.value).join(",")

        await setQueryCategories(values.categories.length ? stringify(values.categories) : null)
        await setQueryMilestoneTypes(values.milestoneTypes.length ? stringify(values.milestoneTypes) : null)
        await setQueryTypes(values.types.length ? stringify(values.types) : null)
        await setQueryCertifications(values.certifications.length ? stringify(values.certifications) : null)
    }

    useEffect(() => {
        const subscription = form.watch(() => form.handleSubmit(handleSubmit)())
        return () => subscription.unsubscribe()
    }, [handleSubmit, form.watch])

    useEffect(() => {
        const parsedFilters = {
            categories: parseQuery(queryCategories),
            milestoneTypes: parseQuery(queryMilestoneTypes),
            types: parseQuery(queryTypes),
            certifications: parseQuery(queryCertifications),
        }

        setFilters(parsedFilters)
        form.reset(parsedFilters)

        // Force search on hydration
        form.handleSubmit(handleSubmit)()
    }, [])

    return (
        <Form {...form}>
            <ScrollArea className="w-full h-full">
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-8 px-1"
                >
                    <h1 className={"scroll-m-20 text-2xl font-semibold tracking-tight"}>
                        Filters
                    </h1>

                    {/*<FormField*/}
                    {/*    control={form.control}*/}
                    {/*    name="categories"*/}
                    {/*    render={({field}) => (*/}
                    {/*        <FormItem>*/}
                    {/*            <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">*/}
                    {/*                Service categories*/}
                    {/*                <Tooltip>*/}
                    {/*                    <TooltipTrigger>*/}
                    {/*                        <Info className="h-4 w-4"/>*/}
                    {/*                    </TooltipTrigger>*/}
                    {/*                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">*/}
                    {/*                        {`The service categories provided by the CRO.`}*/}
                    {/*                    </TooltipContent>*/}
                    {/*                </Tooltip>*/}
                    {/*            </FormLabel>*/}
                    {/*            <FormControl>*/}
                    {/*                <MultipleSelector*/}
                    {/*                    {...field}*/}
                    {/*                    defaultOptions={ASSOCIATED_CATEGORIES}*/}
                    {/*                    hidePlaceholderWhenSelected={true}*/}
                    {/*                    placeholder="Select associated categories..."*/}
                    {/*                    emptyIndicator={*/}
                    {/*                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">*/}
                    {/*                            no results found.*/}
                    {/*                        </p>*/}
                    {/*                    }*/}
                    {/*                />*/}
                    {/*            </FormControl>*/}
                    {/*            <FormMessage/>*/}
                    {/*        </FormItem>*/}
                    {/*    )}*/}
                    {/*/>*/}

                    <FormField
                        control={form.control}
                        name="milestoneTypes"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                    Milestone types
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4"/>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                            {`The milestone types the CRO has services for.`}
                                        </TooltipContent>
                                    </Tooltip>
                                </FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        badgeClassName={badgeVariants({variant: "milestoneType"})}
                                        defaultOptions={MILESTONE_TYPE_OPTIONS_WITH_VALUE}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select associated milestone types..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="types"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                    Business types
                                    {/* <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`The service categories provided by the CRO.`}
                                    </TooltipContent>
                                </Tooltip> */}
                                </FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        defaultOptions={BUSINESS_TYPES}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select associated categories..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="certifications"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                    Certifications
                                    {/* <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`The service categories provided by the CRO.`}
                                    </TooltipContent>
                                </Tooltip> */}
                                </FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        badgeClassName={badgeVariants({variant: "certification"})}
                                        defaultOptions={CRO_CERTIFICATIONS}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select associated categories..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <span className="flex justify-end gap-4 flex-wrap">
                    <Button type="submit" variant="secondary" onClick={() => {
                        setFilters(defaultFilters)
                        form.reset(defaultFilters)
                    }}>Clear All Filters</Button>
                </span>
                </form>
            </ScrollArea>
        </Form>
    )
}
