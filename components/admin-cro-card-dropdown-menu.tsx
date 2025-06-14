"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./ui/select"
import { updateCompany, deleteCompany } from "@/lib/actions";
import { mixpanelTrack } from "@/mixpanel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Company } from "@prisma/client";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multiple-selector";
import {BUSINESS_TYPES, CRO_CERTIFICATIONS, CRO_TAGS} from "@/lib/types";
import React from "react";
import {optionSchema} from "@/components/research-onboarding-form";

const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    website: z.string().url(),
    yearFounded: z.string().optional(),
    headquarters: z.string().optional(),
    type: z.string().optional(),
    certifications: z.array(optionSchema).optional(),
    tags: z.array(optionSchema).optional(),
    services: z.array(optionSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminCROCardDropdownMenu({ cro }: { cro: Company }) {
    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: cro.title,
            description: cro.description || "",
            website: cro.url || "",
            yearFounded: cro.yearEstablished?.toString() || "",
            headquarters: cro.headquarters || "",
            type: cro.companyType || "",
            certifications: cro.simplifiedCertifications.map((certification: any) => ({
                label: certification,
                value: certification
            })) || [],
            tags: cro.tags.map((tag: any) => ({
                label: tag,
                value: tag
            })) || [],
        },
    });

    const handleDeleteCompany = async () => {
        try {
            const res = await deleteCompany(cro);
            if (res.success) {
                mixpanelTrack("Company Deleted", {
                    ID: res.data?.id,
                    Name: res.data?.title,
                });
                toast.success("Successfully deleted company!");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    };

    const handleUpdateCompany = async (values: FormValues) => {
        const formData = new FormData();
        formData.set("orgName", values.name);
        formData.set("description", values.description);
        formData.set("website", values.website);
        formData.set("founded", values.yearFounded || "");
        formData.set("headquarters", values.headquarters || "");
        formData.set("type", values.type || "");

        const mappedData: Record<string, any> = {
            certifications: values.certifications?.map((item) => item.label) || [],
            tags: values.tags?.map((item) => item.label) || [],
        };

        // Add mapped data to FormData
        Object.entries(mappedData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        const response = await updateCompany(cro.id, formData);

        if (response.success) {
            toast.success("Company updated successfully");
            router.refresh();
        } else {
            toast.error(response.error || "Failed to update company");
        }
    };

    return (
        <Dialog>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuGroup>
                        <DialogTrigger asChild>
                            <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Company
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem onClick={handleDeleteCompany}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Company
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>Make changes to the company information below.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleUpdateCompany)}
                        className="grid gap-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                        <Textarea {...field} />
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
                                        <Input {...field} />
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
                                        <Input type="number" {...field} />
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
                                        <Input {...field} />
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
                                    <FormLabel className="font-semibold text-base flex items-center justify-start gap-2">
                                        Business type
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUSINESS_TYPES.map((type) => (
                                                    <SelectItem key={type.id} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="certifications"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Certifications</FormLabel>
                                    <FormDescription>{`The official certifications earned by this service providers. Select all that apply.`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={CRO_CERTIFICATIONS}
                                            hidePlaceholderWhenSelected={true}
                                            placeholder="Select all the certifications that belong to this service provider..."
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
                            name="tags"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormDescription>{`The special "Comend verified" tags that apply to this service provider. Select all that apply.`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={CRO_TAGS}
                                            hidePlaceholderWhenSelected={true}
                                            placeholder="Select all the tags that belong to this service provider..."
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

                        {/*<FormField*/}
                        {/*    control={form.control}*/}
                        {/*    name="services"*/}
                        {/*    render={({field}) => (*/}
                        {/*        <FormItem>*/}
                        {/*            <FormLabel>Services</FormLabel>*/}
                        {/*            <FormDescription>{`The special "Comend verified" tags that apply to this service provider. Select all that apply.`}</FormDescription>*/}
                        {/*            <FormControl>*/}
                        {/*                <MultipleSelector*/}
                        {/*                    {...field}*/}
                        {/*                    defaultOptions={CRO_TAGS}*/}
                        {/*                    hidePlaceholderWhenSelected={true}*/}
                        {/*                    placeholder="Select all the tags that belong to this service provider..."*/}
                        {/*                    emptyIndicator={*/}
                        {/*                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">*/}
                        {/*                            no results found.*/}
                        {/*                        </p>*/}
                        {/*                    }*/}
                        {/*                    showHoverCard={false}*/}
                        {/*                />*/}
                        {/*            </FormControl>*/}
                        {/*            <FormMessage/>*/}
                        {/*        </FormItem>*/}
                        {/*    )}*/}
                        {/*/>*/}

                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
