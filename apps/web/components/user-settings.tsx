"use client"

import {useState} from "react";
import {toast} from "sonner";
import {Button} from "@comend/components/ui/button";
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
} from "@comend/components/ui/alert-dialog";
import {deleteUser, leaveOrganization} from "@comend/lib/actions";
import {useSession} from "next-auth/react";
import {revalidatePath} from "next/cache";
import { signOut } from "next-auth/react"
import {getAllMembershipsFromUserId} from "@comend/lib/fetchers";
import { mixpanelTrack } from "@comend/lib/mixpanel";

export default function UserSettings() {
    const {data: session} = useSession()
    const [isDeleting, setIsDeleting] = useState(false); // Track API call state

    const handleDeleteAccount = async () => {
        setIsDeleting(true); // Disable the button

        try {
            await signOut()
            const response = await deleteUser()

            mixpanelTrack("User Account Deleted", {
                "Name": response?.data?.name,
                "Email": response?.data?.email
            })

            if (response.success) {
                revalidatePath("/app/profile")
                toast.success("Deleted your account successfully.");
            } else {
                toast.error("Failed to delete your account. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsDeleting(false); // Re-enable the button
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div>
                <h2 className="text-md font-semibold leading-6 text-gray-900">
                    Permanent Settings
                </h2>
                <p className="text-sm leading-6 text-gray-500">
                    Anything you change here cannot be undone.
                </p>
            </div>

            {/*<div className="border rounded-md p-8 border-red-200 pt-6 flex items-center justify-between gap-4">*/}
            {/*    <span className="flex flex-grow flex-col">*/}
            {/*        <span className="text-sm font-medium leading-6 text-gray-900">*/}
            {/*            Leave Organization*/}
            {/*        </span>*/}
            {/*        <span className="text-sm text-gray-500">*/}
            {/*            You will be removed from this organization. Your account will remain.*/}
            {/*        </span>*/}
            {/*    </span>*/}

            {/*    <AlertDialog>*/}
            {/*        <AlertDialogTrigger asChild>*/}
            {/*            <Button variant="destructive">*/}
            {/*                Leave organization*/}
            {/*            </Button>*/}
            {/*        </AlertDialogTrigger>*/}
            {/*        <AlertDialogContent>*/}
            {/*            <AlertDialogHeader>*/}
            {/*                <AlertDialogTitle>*/}
            {/*                    Are you absolutely sure?*/}
            {/*                </AlertDialogTitle>*/}
            {/*                <AlertDialogDescription>*/}
            {/*                    This action cannot be undone. This will remove your membership*/}
            {/*                    from this organization. You will have to rejoin to access it again.*/}
            {/*                </AlertDialogDescription>*/}
            {/*            </AlertDialogHeader>*/}
            {/*            <AlertDialogFooter>*/}
            {/*                <AlertDialogCancel>Cancel</AlertDialogCancel>*/}
            {/*                <AlertDialogAction asChild>*/}
            {/*                    <Button*/}
            {/*                        variant="destructive"*/}
            {/*                        onClick={handleLeaveOrganization}*/}
            {/*                        disabled={isLeaving}*/}
            {/*                    >*/}
            {/*                        {isLeaving ? "Leaving..." : "Continue"}*/}
            {/*                    </Button>*/}
            {/*                </AlertDialogAction>*/}
            {/*            </AlertDialogFooter>*/}
            {/*        </AlertDialogContent>*/}
            {/*    </AlertDialog>*/}
            {/*</div>*/}

            <div className="border rounded-md p-8 border-red-200 pt-6 flex items-center justify-between gap-4">
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
    );
}
