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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useForm } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { defaultFilters, MilestoneSearchState, useMilestoneSearchStore } from "@/state/search/milestoneSearchStore"
import { MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS } from "@/lib/types"
import type { Option } from "./ui/multiple-selector"
import MultipleSelector from "./ui/multiple-selector"
import { Checkbox } from "./ui/checkbox"


const selector = (state: MilestoneSearchState) => ({
    filters: state.filters,
    setFilters: state.setFilters
})

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const filtersFormSchema = z.object({
    milestoneTypes: z.array(optionSchema),
    milestoneStatus: z.array(z.string()),
    hasProject: z.boolean(),
    hasAsset: z.boolean()
})

export function MilestoneFilters() {
    const { filters, setFilters } = useMilestoneSearchStore(useShallow(selector))
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
                className="flex flex-col gap-8 px-1"
            >
                <h1 className={"scroll-m-20 text-2xl font-bold tracking-tight"}>
                    Filters
                </h1>

                <FormField
                    control={form.control}
                    name="milestoneTypes"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Milestone types</FormLabel>
                            <FormDescription>{`Types of milestones an organization may have in their research plan`}</FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={MILESTONE_TYPE_OPTIONS}
                                    placeholder="Select milestone types..."
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
                    name="milestoneStatus"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Milestone status</FormLabel>
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
                                    {MILESTONE_STATUS_OPTIONS.map(({label, value}) => (
                                        <ToggleGroupItem
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel className="font-semibold text-base">Projects and assets</FormLabel>
                    <FormField
                        control={form.control}
                        name="hasProject"
                        render={({field}) => (
                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {`Associated Project`}
                                    </FormLabel>
                                    <FormDescription>
                                        {`Include milestones that are associated with a project.`}
                                    </FormDescription>
                                </div>
                            </div>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hasAsset"
                        render={({field}) => (
                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {`Associated Asset`}
                                    </FormLabel>
                                    <FormDescription>
                                        {`Include milestones that are associated with an asset.`}
                                    </FormDescription>
                                </div>
                            </div>
                        )}
                    />
                </FormItem>

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