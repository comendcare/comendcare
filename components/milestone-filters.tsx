import { useShallow } from "zustand/react/shallow"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { defaultFilters, MilestoneSearchState, useMilestoneSearchStore } from "@/state/search/milestoneSearchStore"

const selector = (state: MilestoneSearchState) => ({
    filters: state.filters,
    allResults: state.allResults,
    searchResults: state.searchResults,
    setFilters: state.setFilters
})

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const filtersFormSchema = z.object({
    mechanisms: z.array(optionSchema),
    systemsAffected: z.array(optionSchema),
    modalities: z.array(optionSchema),
    moneyDeployed: z.array(z.number()),
    milestoneTypes: z.array(z.string()),
    milestoneStatus: z.array(z.string()),
    milestoneOutcomes: z.array(z.string()),
    genes: z.array(optionSchema)
})

export function MilestoneFilters() {
    const { filters, allResults, searchResults, setFilters } = useMilestoneSearchStore(useShallow(selector))
    const form = useForm<z.infer<typeof filtersFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(filtersFormSchema),
        defaultValues: filters
    })

    const handleSubmit = async (values: z.infer<typeof filtersFormSchema>) => {
        setFilters(values)
    }

    return (
        <Form {...form}>
            <ScrollArea className="w-full h-full">
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-8 p-1 pr-4"
            >
                <h1 className="text-2xl">{`Milestone Filters`}</h1>

                <span className="flex justify-end gap-4 flex-wrap">
                    <Button type="submit" variant="destructive" onClick={() => {
                        setFilters(defaultFilters)
                        form.reset(defaultFilters)
                    }}>Clear All Filters</Button>
                    <Button type="submit">Apply Filters</Button>
                </span>
            </form>
            </ScrollArea>
        </Form>
    )
}