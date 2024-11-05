"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editUser } from "@/lib/actions"; // Make sure editUser is correctly imported

const invitationFormSchema = z.object({
    name: z.string().min(2, {
        message: "Your name must be at least 2 characters."
    }),
    role: z.string().min(2, {
        message: "Your role must be at least 2 characters.",
    }),
});

export default function UserOnboardingForm() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
    });

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value);
            }
        });

        // For each form field, call editUser to update the user profile
        for (const [key, value] of Object.entries(values)) {
            await editUser(formData, session?.user.id, key).then(
                (res: any) => {
                    if (res.error) {
                        toast.error(res.error);
                        return; // Exit early if there's an error
                    } else {
                        // If all fields are successfully updated, proceed
                        toast.success("Successfully updated user profile!");
                        router.refresh();
                        router.push("/onboarding/organization");
                    }
                }
            )
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Spongebob Squarepants"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Founder and Chair" {...field} />
                            </FormControl>
                            <FormDescription>
                                Your role or title at your patient organization.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Next</Button>
            </form>
        </Form>
    );
}
