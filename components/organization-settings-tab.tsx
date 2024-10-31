"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FormSchema = z.object({
    organizationName: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

export default function OrganizationSettingsTab() {
    const [isDeleting, setIsDeleting] = useState(false); // Track API call state

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            organizationName: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
                label: "Undo",
                onClick: () => console.log("Undo"),
            },
        });
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true); // Disable the button

        try {
            const response = await fetch("/api/account/delete", {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Account deleted successfully.");
            } else {
                toast.error("Failed to delete account. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsDeleting(false); // Re-enable the button
        }
    };

    return (
        <div className="p-8 flex flex-col space-y-16">
            <div>
                <div className="sm:flex sm:items-center">
                    <div className="space-y-2 sm:flex-auto">
                        <h1 className="text-xl font-semibold leading-6 text-gray-900">
                            Account
                        </h1>
                        <p className="text-sm text-gray-700">
                            {`Make changes to your account here. Click save when you're done.`}
                        </p>
                    </div>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-2/3 space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="organizationName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization name</FormLabel>
                                    <FormControl>
                                        <Input id="name" defaultValue="Pedro Duarte" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your public display name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
            <div>
                <h1 className="text-xl font-semibold leading-6 text-gray-900">
                    Permanent Settings
                </h1>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                    Anything you change here cannot be undone.
                </p>

                <div className="mt-10 border rounded-md p-8 border-red-200 pt-6 flex items-center justify-between">
                    <span className="flex flex-grow flex-col">
                        <span className="text-sm font-medium leading-6 text-gray-900">
                            Delete Account
                        </span>
                        <span className="text-sm text-gray-500">
                            You will be logged out and logging in with the same account will
                            create a new account.
                        </span>
                    </span>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete my account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    your account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Deleting..." : "Continue"}
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
