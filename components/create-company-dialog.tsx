"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createCompany } from "@/lib/actions"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import MultipleSelector from "@/components/ui/multiple-selector"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {BUSINESS_TYPES, CRO_CERTIFICATIONS} from "@/lib/types"
import {badgeVariants} from "@/components/ui/badge";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    website: z.string().url("Enter a valid URL"),
    yearFounded: z.string().regex(/^\d{4}$/, "Enter a valid year"),
    headquarters: z.string(),
    type: z.string(),
    services: z.array(optionSchema),
    certifications: z.array(optionSchema),
})

type CreateCompanyFormValues = z.infer<typeof formSchema>

export function CreateCompanyDialog() {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/services?search=${encodeURIComponent(query || "")}`);
        const services = await res.json();

        return services
    };

    const form = useForm<CreateCompanyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            website: "",
            yearFounded: "",
            type: "",
        },
    })

    const handleSubmit = async (values: CreateCompanyFormValues) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.set("orgName", values.name)
            formData.set("description", values.description)
            formData.set("website", values.website)
            formData.set("founded", values.yearFounded)
            formData.set("headquarters", values.headquarters)
            formData.set("type", values.yearFounded)

            // Map form values into FormData
            const data = {
                services: values.services?.map((service) => service.label).join(",") || "",
                certifications: values.certifications?.map((cert) => cert.label).join(",") || "",
            };

            // Append data to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            const response = await createCompany(formData)

            if (response.success) {
                toast.success("Company created successfully")
                form.reset()
                setOpen(false)
            } else {
                toast.error(response.error || "An error occurred while creating the company.")
            }
        } catch (error) {
            console.error("Create company error:", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Company</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Company</DialogTitle>
                    <DialogDescription>
                        {`Enter the company's information. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Company Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What does this company do?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="yearFounded"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Year Founded</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 2012" type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="headquarters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Headquarters</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Toronto, Canada" type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a business type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {BUSINESS_TYPES.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="services"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Services
                                    </FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                                {...field}
                                                onSearch={handleAsyncSearch}
                                                placeholder="Search for services..."
                                                triggerSearchOnFocus={true}
                                                hidePlaceholderWhenSelected={true}
                                                loadingIndicator={
                                                <p
                                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
                                                >
                                                    Loading services...
                                                </p>}
                                                emptyIndicator={<p>No services found.</p>}
                                                showHoverCard={false}
                                            />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="certifications"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Certifications
                                    </FormLabel>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            badgeClassName={badgeVariants({variant: "lightBlue"})}
                                            defaultOptions={CRO_CERTIFICATIONS}
                                            hidePlaceholderWhenSelected={true}
                                            placeholder="Select relevant certifications..."
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

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
