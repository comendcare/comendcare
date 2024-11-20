import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { useShallow } from "zustand/react/shallow"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
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

const selector = (state: OrganizationSearchState) => ({
    filters: state.filters,
    searchResults: state.searchResults,
    setFilters: state.setFilters
})

const filtersFormSchema = z.object({
    genes: z.array(z.string()).optional(),
    patientsRange: z.array(z.number()).length(2).optional()
})

const range = [0, 100]

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

    const numPatientsIdentifiedChartData = (new Array((range[1] - range[0])/10).fill(0)).map((value, index) => ({
        xAxis: index,
        data: searchResults.filter(
            (result) => 
                result.document.numberOfIdentifiedPatients >= index*10 && 
                result.document.numberOfIdentifiedPatients < (index+1)*10 
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
                    name="patientsRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl mt-2">{`Number of Patients`}</FormLabel>
                            <FormControl>
                                <DoubleSliderBarChart 
                                    chartData={numPatientsIdentifiedChartData}
                                    range={range}
                                    onChange={field.onChange}
                                    value={field.value}
                                    step={10}
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