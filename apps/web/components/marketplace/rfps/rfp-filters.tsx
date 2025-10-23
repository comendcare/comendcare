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
} from "@comend/components/ui/form"
import {useForm} from "react-hook-form"
import {ScrollArea} from "@comend/components/ui/scroll-area"
import {Button} from "@comend/components/ui/button"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import {BUSINESS_TYPES, CRO_CERTIFICATIONS, CRO_TAGS, MILESTONE_TYPE_OPTIONS, optionSchema} from "@comend/lib/types"
import {defaultFilters, CROSearchState, useCROSearchStore} from "@/state/search/croSearchStore";
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import {useEffect} from "react"
import {Info} from "lucide-react"
import { badgeVariants } from "@comend/components/ui/badge"
import { usePathname, useSearchParams } from "next/navigation"
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore"

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map(option => ({
    ...option,
    value: option.id,
}));

const selector = (state: RFPSearchState) => ({
    filters: state.filters,
    allResults: state.allResults,
    setFilters: state.setFilters
})

const filtersFormSchema = z.object({
    categories: z.array(optionSchema),
    milestoneTypes: z.array(optionSchema),
    types: z.array(optionSchema),
    certifications: z.array(optionSchema),
    tags: z.array(optionSchema),
})

export function RFPFilters() {
    const {filters, allResults, setFilters} = useRFPSearchStore(useShallow(selector))
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

        // params.delete("milestoneTypes")
        // if (values.milestoneTypes && values.milestoneTypes.length > 0) params.set("milestoneTypes", stringify(values.milestoneTypes))

        // params.delete("categories")
        // if (values.categories && values.categories.length > 0) params.set("categories", stringify(values.categories))

        // params.delete("types")
        // if (values.types && values.types.length > 0) params.set("types", stringify(values.types))

        // params.delete("certifications")
        // if (values.certifications && values.certifications.length > 0) params.set("certifications", stringify(values.certifications))

        // params.delete("tags")
        // if (values.tags && values.tags.length > 0) params.set("tags", stringify(values.tags))

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
