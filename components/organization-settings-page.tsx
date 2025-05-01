"use client"

import {useState} from "react";
import {getRoadmaps} from "@/lib/fetchers";
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
import {deleteOrganization, deleteOrgRoadmap} from "@/lib/actions";
import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "@/app/mixpanel";

export default function OrganizationSettingsPage({organization}: { organization: Organization }) {
    const {data: session, update} = useSession()
    const [isDeleting, setIsDeleting] = useState(false); // Track API call state

    const handleDeleteOrganization = async () => {
        setIsDeleting(true); // Disable the button

        try {
            await deleteOrganization(organization)
                .then(async res => {
                    if (res.success) {
                        await update({
                            user: {
                                ...session?.user,
                                organizationId: undefined,
                                membership: undefined,
                            }
                        })

                        mixpanelTrack("Organization Deleted", {
                            "ID": res?.data?.id,
                            "Name": res?.data?.name,
                        })
                        toast.success(`Successfully deleted organization!`)
                    } else {
                        toast.error(res.error)
                    }
                })
                .catch((err: Error) => toast.error(err.message))
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsDeleting(false); // Re-enable the button
        }
    };

    async function handleDeleteRoadmap() {
        try {
            if (!session?.user?.organizationId) throw new Error('Organization id is not defined')

            const {success, data: roadmaps} = await getRoadmaps(session?.user?.organizationId)

            if (!success || !roadmaps || roadmaps.length <= 0) throw new Error('Could not find research plan for organzation')

            const response = await deleteOrgRoadmap(roadmaps[0].id, session?.user?.organizationId)

            mixpanelTrack("Research Plan Deleted")

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
        <main className="flex flex-col items-start w-full h-screen mx-auto p-4 space-y-8">
            <div className="w-full flex flex-col space-y-4">
                <div>
                    <h2 className="text-xl font-semibold leading-6 text-gray-900">
                        Permanent Settings
                    </h2>
                    <p className="text-sm leading-6 text-gray-500">
                        {`Only organization members with the "Owner" role can use these settings. Anything you change here cannot be undone.`}
                    </p>
                </div>

                <div className={`${session?.user?.membership?.role !== "owner" ? "mt-8 opacity-50 cursor-not-allowed space-y-4" : "space-y-4"}`}>
                    <div
                        className="w-full border rounded-md p-8 border-red-200 flex items-center justify-between gap-4">
                        <span className="flex flex-grow flex-col">
                            <span className="text-sm font-medium leading-6 text-gray-900">
                                Delete Organization
                            </span>
                            <span className="text-sm text-gray-500">
                                This will delete all memberships, roadmaps, and tasks from this organization.
                                This organization will then be permanently deleted.
                            </span>
                        </span>

                        <AlertDialog>
                            <AlertDialogTrigger asChild disabled={session?.user?.membership?.role !== "owner"}>
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

                {/*<DeleteOrganizationForm organization={organization}/>*/}

            </div>
        </main>
    )
}
