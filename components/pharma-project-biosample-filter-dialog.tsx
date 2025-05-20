"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Input} from "@/components/ui/input"
import MultipleSelector from "@/components/ui/multiple-selector"
import {Slider} from "@/components/ui/slider"
import {useState} from "react"
import {Filter} from "lucide-react"

const biosampleFilterSchema = z.object({
    type: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    pathology: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    preservationMethod: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    donorSex: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    donorRace: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    country: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    treatments: z.array(z.object({label: z.string(), value: z.string()})).optional(),
    donorAgeRange: z.tuple([z.number(), z.number()])
})

export default function PharmaProjectBiosampleFilterDialog() {
    const form = useForm<z.infer<typeof biosampleFilterSchema>>({
        resolver: zodResolver(biosampleFilterSchema),
        defaultValues: {
            donorAgeRange: [0, 100]
        }
    })

    const onSubmit = (values: z.infer<typeof biosampleFilterSchema>) => {
        console.log("Filters:", values)
    }

    const OPTIONS = {
        type: ["post-mortem tissue", "proteomics", "fibroblast", "epigenetics", "buccal swabs"],
        pathology: ["Normal", "Tumor", "Inflammatory"],
        preservationMethod: ["Cryopreserved", "Formalin-fixed", "Refrigerated", "Flash Frozen"],
        donorSex: ["Male", "Female"],
        donorRace: ["White", "Asian", "Mixed"],
        country: ["USA", "UK", "Italy", "Australia"],
        treatments: ["Temozolomide", "Gene Therapy", "Enzyme Replacement", "None"]
    }

    const toSelectOptions = (values: string[]) =>
        values.map((v) => ({label: v, value: v}))

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="ml-auto hidden h-8 lg:flex">
                    <Filter className="mr-2 h-4 w-4"/>
                    Biosample Filters
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-h-[80vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Filter Biosamples</DialogTitle>
                    <DialogDescription>Use the filters below to narrow down biosample results.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {([
                            ["type", "Sample Type"],
                            ["pathology", "Pathology"],
                            ["preservationMethod", "Preservation Method"],
                            ["donorSex", "Donor Sex"],
                            ["donorRace", "Donor Race"],
                            ["country", "Country"],
                            ["treatments", "Treatment"]
                        ] as const).map(([name, label]) => (
                            <FormField
                                key={name}
                                control={form.control}
                                name={name}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{label}</FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={toSelectOptions(OPTIONS[name])}
                                                placeholder={`Select ${label.toLowerCase()}...`}
                                                hidePlaceholderWhenSelected
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        ))}

                        <FormField
                            control={form.control}
                            name="donorAgeRange"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Donor Age Range</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col space-y-2">
                                            <Slider
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>{field.value[0]} yrs</span>
                                                <span>{field.value[1]} yrs</span>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">Apply Filters</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
