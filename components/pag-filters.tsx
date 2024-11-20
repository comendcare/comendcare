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
import { DoubleSlider } from "./ui/slider-double"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { SliderThumb } from "@radix-ui/react-slider"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"

const selector = (state: OrganizationSearchState) => ({
    filters: state.filters,
    setFilters: state.setFilters
})

const filtersFormSchema = z.object({
    genes: z.array(z.string()).optional(),
    patientsRange: z.array(z.number()).length(2).optional()
})

export function PAGFilters() {
    const { filters, setFilters } = useOrganizationSearchStore(useShallow(selector))
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
                className="flex flex-col gap-8 pr-4"
            >
                <h1 className="text-2xl">{`Organization Filters`}</h1>
                {/* <FormField
                    control={form.control}
                    name="patientsRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl mt-2">{`Number of Patients`}</FormLabel>
                            <FormControl>
                                <>
                                <DoubleSlider 
                                    step={1} 
                                    minStepsBetweenThumbs={1}
                                    defaultValue={filters.patientsRange}
                                    onValueChange={field.onChange}
                                />
                                <span className="flex flex-row justify-between">
                                    <p>{field.value ? field.value[0] : 0}</p>
                                    <p>{field.value ? field.value[1] : 1000}</p>
                                </span>
                                </>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}

                <span className="flex justify-end gap-4 flex-wrap">
                    <Button type="submit">Apply Filters</Button>
                </span>
            </form>
            </ScrollArea>
        </Form>
    )
}