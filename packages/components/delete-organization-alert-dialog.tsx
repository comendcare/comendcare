"use client"

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
} from "./ui/alert-dialog";
import {useSession} from "next-auth/react";
import {useState} from "react";
import {deleteOrganization} from "./../../packages/lib/actions";
import { mixpanelTrack } from "./../../packages/lib/mixpanel";
import {toast} from "sonner";
import {Button} from "./ui/button";
import {Organization} from "@prisma/client";
import {useRouter} from "next/navigation";


export function DeleteOrganizationAlertDialog({organization}: { organization: Organization }) {
    const {data: session} = useSession()
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false); // Track API call state

    const handleDeleteOrganization = async () => {
        setIsDeleting(true); // Disable the button

        try {
            await deleteOrganization(organization.id, organization)
                .then(async res => {
                    if (res.success) {
                        router.refresh();

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

    return (
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
    )
}
