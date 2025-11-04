"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@comend/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog"
import { Input } from "@comend/components/ui/input"
import { Textarea } from "@comend/components/ui/textarea"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@comend/components/ui/form"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@comend/components/ui/select"
import {BIOSAMPLE_TYPE_OPTIONS, BUSINESS_TYPES, CRO_CERTIFICATIONS, CRO_TAGS, DISEASE_MODEL_TYPE_OPTIONS, optionSchema} from "@comend/lib/types"
import {badgeVariants} from "@comend/components/ui/badge";
import { createCompany } from "~admin/lib/actions"
import { CreateFacilityForm, FacilityCreateRequest } from "./facility-create-request-data-table/facility-create-request-data-table"
import { companyFormSchema } from "~admin/lib/types"
import { Option } from "@/packages/lib/types"

export function CreateCompanyDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Service Provider</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Service Provider</DialogTitle>
                    <DialogDescription>
                        {`Enter the service provider's information. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <CreateCompanyForm onCloseCallback={() => setOpen(false)}/>
            </DialogContent>
        </Dialog>
    )
}

export function CreateCompanyForm({
    request, 
    onCloseCallback,
    handleRequestDeleteCallback
}: {
    request?: FacilityCreateRequest, 
    onCloseCallback?: () => void,
    handleRequestDeleteCallback?: () => void,
}) {
    const [loading, setLoading] = useState(false)
    const form = useForm<z.infer<typeof companyFormSchema>>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: request?.name ?? "",
            description: "",
            website: "",
            yearFounded: "",
            type: "",
            tools: request 
                ? [
                    request.biosample ? {
                        value: request.biosample.id,
                        type: 'Biosamples',
                        icon: 'test-tube-diagonal',
                        // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`,
                        label: `${request.biosample.id} - ${(BIOSAMPLE_TYPE_OPTIONS.filter((option: Option) => request.biosample.types?.includes(option.value)))?.map((option: Option) => option?.label)?.join(', ')}`,
                        biosample: request.biosample
                    } : undefined,
                    request.diseaseModel ? {
                        value: request.diseaseModel.id,
                        label: `${request.diseaseModel.id} - ${(DISEASE_MODEL_TYPE_OPTIONS.filter((option: Option) => request.diseaseModel.types?.includes(option.value)))?.map((option: Option) => option?.label)?.join(', ')}`,
                        icon: 'rat',
                        type: 'Disease Models',
                        diseaseModel: request.diseaseModel
                    } : undefined,
                    request.clinicalDataset ? {
                        value: request.clinicalDataset.id,
                        label: `${request.clinicalDataset.id} - ${request.clinicalDataset.title}`,
                        icon: 'database',
                        type: 'Clinical Datasets',
                        datasample: request.clinicalDataset,
                    } : undefined
                ].filter(option => option !== undefined) 
                : [],
        },
    })

    const handleAsyncSearch = async (query: string) => {
        const res = await fetch(`/api/services?search=${encodeURIComponent(query || "")}`);
        const services = await res.json();

        return services
    }

    const handleToolAsyncSearch = async (query: string): Promise<Option[]> => {
        const toolsResponse = await fetch(`/api/tools?search=${query}`)
        const toolsData = await toolsResponse.json()

        return toolsData
    }

    const handleSubmit = async (values: z.infer<typeof companyFormSchema>) => {
        setLoading(true)
        try {
            const response = await createCompany(values)

            if (response.success) {
                toast.success("Service Provider created successfully")
                form.reset()
                if (onCloseCallback) onCloseCallback()
            } else {
                toast.error(response.error || "An error occurred while creating the Service Provider.")
            }
        } catch (error) {
            console.error("Create Service Provider error:", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 p-1 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Service Provider Name" {...field} />
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
                                <Textarea placeholder="What does this service provider do?" {...field} />
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

                <FormField
                    control={form.control}
                    name="tags"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>
                                Tags
                            </FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    badgeClassName={badgeVariants({variant: "lightBlue"})}
                                    defaultOptions={CRO_TAGS}
                                    hidePlaceholderWhenSelected={true}
                                    placeholder="Select relevant tags..."
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
                    name="tools"
                    render={({field}) => (
                        <FormItem className="w-full">
                            <FormLabel>{`Linked Tools`}</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    onSearch={handleToolAsyncSearch}
                                    hidePlaceholderWhenSelected={true}
                                    showHoverCard={false}
                                    placeholder="Search..."
                                    badgeClassName="border-transparent bg-green-100 text-green-900"
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    groupBy={'type'}
                                />
                            </FormControl>
                            <FormMessage className="text-primary"/>
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"secondary"}>
                            Cancel
                        </Button>
                    </DialogClose>
                    {(request && handleRequestDeleteCallback) && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="destructive">
                                    Delete request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your request and it's data.`}
                                    </DialogDescription>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button type="button">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <DialogClose>
                                            <Button
                                                type="button"
                                                variant={"destructive"}
                                                onClick={() => handleRequestDeleteCallback()}
                                            >
                                                Delete request
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create company"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}