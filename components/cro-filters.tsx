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
import { ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS } from "@/lib/types"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import {defaultFilters, CROSearchState, useCROSearchStore} from "@/state/search/croSearchStore";

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
    systems: z.array(optionSchema),
})

export function CROFilters() {
    const { filters, allResults, setFilters } = useCROSearchStore(useShallow(selector))
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
                <h1 className={"scroll-m-20 text-2xl font-semibold tracking-tight"}>
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

                <span className="flex justify-end gap-4 flex-wrap">
                    <Button type="submit" variant="secondary" onClick={() => {
                        setFilters(defaultFilters)
                        form.reset(defaultFilters)
                    }}>Clear All Filters</Button>
                    <Button variant="secondary" type="submit">Apply Filters</Button>
                </span>
            </form>
            </ScrollArea>
        </Form>
    )
}
