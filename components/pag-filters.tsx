import { defaultFilters, OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { useShallow } from "zustand/react/shallow"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { DoubleSliderBarChart } from "./ui/slider-double"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import MultipleSelector from "./ui/multiple-selector"
import { ASSOCIATED_SYSTEMS, MILESTONE_TYPE_OPTIONS, MODALITIES, MOLECULAR_MECHANISMS } from "@/lib/types"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import type { Option } from "./ui/multiple-selector"

const selector = (state: OrganizationSearchState) => ({
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
    mechanisms: z.array(optionSchema),
    systems: z.array(optionSchema),
    modalities: z.array(optionSchema),
    // moneyDeployed: z.array(z.number()),
    // genes: z.array(optionSchema)
})

export function PAGFilters() {
    const { filters, allResults, setFilters } = useOrganizationSearchStore(useShallow(selector))
    const form = useForm<z.infer<typeof filtersFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(filtersFormSchema),
        defaultValues: filters
    })

    const handleSubmit = async (values: z.infer<typeof filtersFormSchema>) => {
        setFilters(values)
    }

    const moneyDeployedRange = [0, 10000000]
    const moneyDeployedStep = moneyDeployedRange[1]/50
    const moneyDeployedChartData = (new Array((moneyDeployedRange[1] - moneyDeployedRange[0])/moneyDeployedStep).fill(0)).map((value, index) => ({
        xAxis: index,
        data: allResults.filter(
            result => result.document.moneyDeployed >= index*moneyDeployedStep && result.document.moneyDeployed < (index+1)*moneyDeployedStep
        ).length
    }))

    return (
        <Form {...form}>
            <ScrollArea className="w-full h-full">
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-8 px-1"
            >
                <h1 className={"scroll-m-20 text-3xl font-bold tracking-tight"}>
                    Filters
                </h1>

                <FormField
                    control={form.control}
                    name="systems"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Associated systems</FormLabel>
                            <FormDescription>{`The systems affected by a condition.`}</FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={ASSOCIATED_SYSTEMS}
                                    hidePlaceholderWhenSelected={true}
                                    placeholder="Select associated systems..."
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
                    name="mechanisms"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">
                                Mechanisms of action
                            </FormLabel>
                            <FormDescription className="flex items-center">
                                {`The type of condition a patient advocacy group focuses on.`}
                            </FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={MOLECULAR_MECHANISMS}
                                    placeholder="Select mechanisms..."
                                    hidePlaceholderWhenSelected={true}
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
                    name="modalities"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">
                                Modalities of interest
                            </FormLabel>
                            <FormDescription className="flex items-center">
                                {`The treatment modalities of interest to an organization.`}
                            </FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={MODALITIES}
                                    hidePlaceholderWhenSelected={true}
                                    placeholder="Select modalities..."
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