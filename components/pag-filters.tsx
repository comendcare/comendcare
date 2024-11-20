import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
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
import { OPTIONS } from "./research-onboarding-form"

const selector = (state: OrganizationSearchState) => ({
    filters: state.filters,
    searchResults: state.searchResults,
    setFilters: state.setFilters
})

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const filtersFormSchema = z.object({
    modalities: z.array(optionSchema),
    categories: z.array(optionSchema),
    moneyDeployed: z.array(z.number()),
})

export function PAGFilters() {
    const { filters, searchResults, setFilters } = useOrganizationSearchStore(useShallow(selector))
    const form = useForm<z.infer<typeof filtersFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(filtersFormSchema),
        defaultValues: filters
    })

    const handleSubmit = async (values: z.infer<typeof filtersFormSchema>) => {
        setFilters(values)
    }

    const moneyDeployedRange = [0, 10000000]
    const moneyDeployedStep = 250000
    const moneyDeployedChartData = (new Array((moneyDeployedRange[1] - moneyDeployedRange[0])/moneyDeployedStep).fill(0)).map((value, index) => ({
        xAxis: index,
        data: searchResults.filter(
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
                    name="categories"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Disease categories</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={OPTIONS}
                                    placeholder="Select categories..."
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
                            <FormLabel>Modalities</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={OPTIONS}
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
                    <Button type="submit">Apply Filters</Button>
                </span>
            </form>
            </ScrollArea>
        </Form>
    )
}