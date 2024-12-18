"use client"

import InviteUserToOrgDialog from "@/components/invite-user-to-org-dialog";
import Image from "next/image";
import {toast} from "sonner";
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
import { Button } from "./ui/button"
import { getRoadmapId } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import { deleteOrgRoadmap } from "@/lib/actions";

export default function PAGDashboardOrgSettingsTab() {
    const {data: session} = useSession()

    if (!session?.user?.organizationId) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-20">
                <Image
                    alt="missing organization"
                    src="https://illustrations.popsy.co/gray/success.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="missing organization"
                    src="https://illustrations.popsy.co/white/success.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    No organization yet.
                </p>
                <div className="mt-8">
                    <InviteUserToOrgDialog />
                </div>
            </div>
        );
    }

    async function handleDeleteRoadmap () {
        try {
            if (!session?.user?.organizationId) throw new Error('Organization id is not defined')

            const { success, data: roadmapId } = await getRoadmapId(session?.user?.organizationId)

            if (!success || !roadmapId) throw new Error('Could not find research plan')

            const response = await deleteOrgRoadmap(roadmapId, session?.user?.organizationId)

            if (!response.success) {
                toast.error("An error occurred. Please try again later.")
                return
            }

            toast.success("Research plan deleted successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        }
    }

    return (
        <div className="flex flex-col space-y-16 p-4">
            <div>
                <h1 className="text-xl font-semibold leading-6 text-gray-900">
                    Organization Settings
                </h1>

                <div className="mt-10 border rounded-md p-8 border-red-200 pt-6 flex items-center justify-between">
                    <span className="flex flex-grow flex-col">
                        <span className="text-sm font-medium leading-6 text-gray-900">
                            Delete organization research plan
                        </span>
                        <span className="text-sm text-gray-500">
                            {`The research plan for your organization will be deleted.`}
                        </span>
                    </span>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                Delete research plan
                            </Button>
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
                                        onClick={handleDeleteRoadmap}
                                    >
                                        {"Continue"}
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
