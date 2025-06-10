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

import { updateCompany, deleteCompany } from "@/lib/actions";
import { mixpanelTrack } from "@/app/mixpanel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Company } from "@prisma/client";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    website: z.string().url(),
    yearFounded: z.string().optional(),
    headquarters: z.string().optional(),
    type: z.string().optional(),
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
            <DropdownMenu>
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

            <DialogContent>
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
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
