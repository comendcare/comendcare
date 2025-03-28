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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useForm } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { defaultFilters, MilestoneSearchState, useMilestoneSearchStore } from "@/state/search/milestoneSearchStore"
import { MILESTONE_STATUS_OPTIONS, NODE_TYPE_OPTIONS } from "@/lib/types"
import MultipleSelector from "./ui/multiple-selector"
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import { useEffect } from "react"
import { Info } from "lucide-react"

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
    nodeType: z.array(z.string())
    // hasProject: z.boolean(),
    // hasAsset: z.boolean()
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

    useEffect(() => {
        const subscription = form.watch(() => form.handleSubmit(handleSubmit)())
        return () => subscription.unsubscribe()
    }, [handleSubmit, form.watch])

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
                            <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                Milestone types
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`Types of milestones an organization may have in their research plan`}
                                    </TooltipContent>
                                </Tooltip>
                            </FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    // defaultOptions={MILESTONE_TYPE_OPTIONS}
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
                            <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                Milestone status
                                {/* <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`Types of milestones an organization may have in their research plan`}
                                    </TooltipContent>
                                </Tooltip> */}
                            </FormLabel>
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

                <FormField
                    control={form.control}
                    name="nodeType"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                Milestone class
                                {/* <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4"/>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                        {`Types of milestones an organization may have in their research plan`}
                                    </TooltipContent>
                                </Tooltip> */}
                            </FormLabel>
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
                                    {NODE_TYPE_OPTIONS.map(({label, value}) => (
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

                {/* <FormItem>
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
                </FormItem> */}

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