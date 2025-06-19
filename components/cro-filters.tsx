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
import {ASSOCIATED_CATEGORIES, BUSINESS_TYPES, CRO_CERTIFICATIONS, CRO_TAGS, MILESTONE_TYPE_OPTIONS} from "@/lib/types"
import {ToggleGroup, ToggleGroupItem} from "./ui/toggle-group"
import {defaultFilters, CROSearchState, useCROSearchStore} from "@/state/search/croSearchStore";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import {useEffect} from "react"
import {Info} from "lucide-react"
import {useQueryState} from "nuqs"
import { badgeVariants } from "./ui/badge"
import { usePathname, useSearchParams } from "next/navigation"

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
    tags: z.array(optionSchema),
})

export function CROFilters() {
    const {filters, allResults, setFilters} = useCROSearchStore(useShallow(selector))
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const form = useForm<z.infer<typeof filtersFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(filtersFormSchema),
        defaultValues: filters
    })

    const handleSubmit = async (values: z.infer<typeof filtersFormSchema>) => {
        setFilters(values)

        const stringify = (arr: { value: string }[]) => arr.map(x => x.value).join(",")
        const params = new URLSearchParams(searchParams.toString())

        params.delete("milestoneTypes")
        if (values.milestoneTypes && values.milestoneTypes.length > 0) params.set("milestoneTypes", stringify(values.milestoneTypes))

        params.delete("categories")
        if (values.categories && values.categories.length > 0) params.set("categories", stringify(values.categories))

        params.delete("types")
        if (values.types && values.types.length > 0) params.set("types", stringify(values.types))

        params.delete("certifications")
        if (values.certifications && values.certifications.length > 0) params.set("certifications", stringify(values.certifications))

        params.delete("tags")
        if (values.tags && values.tags.length > 0) params.set("tags", stringify(values.tags))

        // ensure shallow url update
        const url = params.size > 0 ? `${pathname}?${params}` : `${pathname}`
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url)
    }

    useEffect(() => {
        const subscription = form.watch((values, { name }) => {
            if (name) {
                handleSubmit(values as any)
            }
        })

        return () => subscription.unsubscribe()
    }, [form.watch])

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
                                    Project types
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4"/>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                            {`The project types the provider has services for.`}
                                        </TooltipContent>
                                    </Tooltip>
                                </FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                                        defaultOptions={MILESTONE_TYPE_OPTIONS_WITH_VALUE}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select associated project types..."
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
                                        placeholder="Select business types..."
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
                                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                                        defaultOptions={CRO_CERTIFICATIONS}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select relevant certifications..."
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
                        name="tags"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                    Tags
                                </FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                                        defaultOptions={CRO_TAGS}
                                        hidePlaceholderWhenSelected={true}
                                        placeholder="Select relevant tags..."
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
