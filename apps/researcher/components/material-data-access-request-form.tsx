"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@comend/components/ui/form";
import { Input } from "@comend/components/ui/input";
import { Textarea } from "@comend/components/ui/textarea";
import { Button } from "@comend/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { createMaterialAndDataAccessRequest } from "@comend/lib/actions";
import {getAllOrganizations} from "@comend/lib/fetchers";
import { Option } from "@comend/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@comend/components/ui/select";
import LoadingDots from "@comend/components/icons/loading-dots";

const accessRequestSchema = z.object({
    title: z.string().min(3, { message: "Title is required and must be at least 3 characters long." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    organizationId: z.string().min(1, { message: "You must select an organization." }),
});

export default function MaterialAndDataAccessRequestForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<Option[]>([]);

    const form = useForm<z.infer<typeof accessRequestSchema>>({
        resolver: zodResolver(accessRequestSchema),
        defaultValues: {
            title: "",
            description: "",
            organizationId: "",
        },
    });

    useEffect(() => {
        async function fetchOrgs() {
            try {
                const response = await getAllOrganizations({
                    id: true,
                    name: true,
                    description: true,
                })
                if (response.success && Array.isArray(response.data)) {
                    const orgOptions = response.data.map((org: any) => ({
                        label: org.name,
                        value: org.id,
                    }));
                    setOrganizations(orgOptions);
                } else {
                    toast.error("Failed to load organizations.");
                }
            } catch (error) {
                toast.error("Error loading organizations.");
                console.error(error);
            }
        }
        fetchOrgs();
    }, []);

    async function onSubmit(values: z.infer<typeof accessRequestSchema>) {
        setLoading(true);

        const formData = new FormData();

        const data = {
            name: values.title || "",
            description: values.description || "",
        };

        // Append data to FormData
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value)
            }
        });

        try {
            const res = await createMaterialAndDataAccessRequest(formData as any);

            if (res?.error) {
                toast.error(res.error);
                return;
            }

            toast.success("Request submitted successfully!");
            router.push("/requests"); // or wherever it makes sense to redirect
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during submission.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <h1 className="text-xl font-semibold mb-4">Material and Data Access Request</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Request Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Access to tissue samples from study X" {...field} />
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
                                <FormLabel>Request Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={5}
                                        placeholder="Describe what materials/data you need and why..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="organizationId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Organization</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an organization..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {organizations.map((org) => (
                                            <SelectItem key={org.value} value={org.value}>
                                                {org.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? <LoadingDots color="#808080" /> : "Submit Request"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
