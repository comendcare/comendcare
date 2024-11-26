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
import { DoubleSlider, DoubleSliderBarChart } from "./ui/slider-double"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { ChartConfig, ChartContainer } from "./ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { FaQuestionCircle } from "react-icons/fa"
import MultipleSelector from "./ui/multiple-selector"
import { CONDITION_MECHANISM_OPTIONS, MILESTONE_OUTCOME_OPTIONS, MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS, MODALITIES_OF_INTEREST_OPTIONS, SYSTEMS_AFFECTED_OPTIONS } from "./research-onboarding-form"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"

const selector = (state: OrganizationSearchState) => ({
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

// const genesList = [
//     'CRN1',
//     'MYOP1',
//     'MSU2',
//     'NEUA',
//     'NF4B',
//     'LYSO1',
//     'ARC1',
//     'NEU4',
//     'GEL3',
//     'M4SF',
//     'NEP1',
//     'REN1'
// ]

export function PAGFilters() {
    const { filters, allResults, searchResults, setFilters } = useOrganizationSearchStore(useShallow(selector))
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
                className="flex flex-col gap-8 pr-4"
            >
                <h1 className="text-2xl">{`Organization Filters`}</h1>
                <FormField
                    control={form.control}
                    name="mechanisms"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Disease Mechanisms</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={CONDITION_MECHANISM_OPTIONS}
                                    placeholder="Select disease mechanisms..."
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    groupBy="group"
                                    showHoverCard={false}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="systemsAffected"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Systems Affected</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={SYSTEMS_AFFECTED_OPTIONS}
                                    placeholder="Select affected systems..."
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    showHoverCard={false}
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
                            <FormLabel>Modalities</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={MODALITIES_OF_INTEREST_OPTIONS}
                                    placeholder="Select modalities..."
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    groupBy="group"
                                    showHoverCard={false}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="milestoneTypes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Milestone Types</FormLabel>
                            <FormDescription>{`Types of milestones an organization may have in their research plan`}</FormDescription>
                            <FormControl>
                                <ToggleGroup
                                    type="multiple"
                                    variant="outline"
                                    value={field.value}
                                    onValueChange={
                                        field.onChange
                                    }
                                    className="w-fit flex flex-wrap gap-2 justify-start"
                                >
                                    {MILESTONE_TYPE_OPTIONS.map((type: string) => (
                                        <ToggleGroupItem
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="milestoneStatus"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Milestone Status</FormLabel>
                            <FormControl>
                                <ToggleGroup
                                    type="multiple"
                                    variant="outline"
                                    value={field.value}
                                    onValueChange={
                                        field.onChange
                                    }
                                    className="w-fit flex flex-wrap gap-2 justify-start"
                                >
                                    {MILESTONE_STATUS_OPTIONS.map((type: string) => (
                                        <ToggleGroupItem
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="milestoneOutcomes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Milestone Outcomes</FormLabel>
                            <FormControl>
                                <ToggleGroup
                                    type="multiple"
                                    variant="outline"
                                    value={field.value}
                                    onValueChange={
                                        field.onChange
                                    }
                                    className="w-fit flex flex-wrap gap-2 justify-start"
                                >
                                    {MILESTONE_OUTCOME_OPTIONS.map((type: string) => (
                                        <ToggleGroupItem
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {/* <FormField
                    control={form.control}
                    name="genes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Genes</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={genesList.map((name: string, index: number) => ({ id: index.toString(), label: name, value: name, description: '', strengths: '' }))}
                                    placeholder="Select genes..."
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
                /> */}

                <FormField
                    control={form.control}
                    name="moneyDeployed"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel>$ Deployed for Research</FormLabel>
                            <FormControl>
                                <DoubleSliderBarChart 
                                    chartData={moneyDeployedChartData}
                                    range={moneyDeployedRange}
                                    onChange={field.onChange}
                                    value={field.value}
                                    step={moneyDeployedStep}
                                />
                            </FormControl>
                            <FormMessage />
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