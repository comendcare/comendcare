"use client"

import {useState} from "react";
import {getSession} from "@/lib/auth"
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import NoOrganizationPage from "@/components/no-organization-page";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
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
import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

export default function OrganizationSettingsPage({organization}: {organization: Organization}) {
    const {data: session, update} = useSession()
    const [isDeleting, setIsDeleting] = useState(false); // Track API call state

    const handleDeleteOrganization = async () => {
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

    if (organization) {
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <UnverifiedOrganizationPage/>
            );
        }

        return (
            <main className="flex flex-col items-start w-full h-screen mx-auto p-8 space-y-8">
                <div className="flex flex-col space-y-8 w-full">
                    <div className="space-y-2 sm:flex-auto">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Settings
                        </h1>
                        <p className="text-sm text-gray-700">
                            Organization-wide settings.
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col space-y-4">
                    <div>
                        <h2 className="text-md font-semibold leading-6 text-gray-900">
                            Permanent Settings
                        </h2>
                        <p className="text-sm leading-6 text-gray-500">
                            Anything you change here cannot be undone.
                        </p>
                    </div>

                    <div className="w-full border rounded-md p-8 border-red-200 pt-6 flex items-center justify-between gap-4">
                        <span className="flex flex-grow flex-col">
                            <span className="text-sm font-medium leading-6 text-gray-900">
                                Delete Organization
                            </span>
                            <span className="text-sm text-gray-500">
                                This will delete all memberships, roadmaps, and kanban tasks from this organization.
                                This organization will then be permanently deleted.
                            </span>
                        </span>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    Delete organization
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will remove all memberships
                                        from this organization, delete all associated roadmaps,
                                        then delete the organization.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteOrganization}
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
            </main>
        )
    } else {
        return (
            <NoOrganizationPage/>
        );
    }
}