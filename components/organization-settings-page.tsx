"use client"

import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";
import {DeleteOrganizationAlertDialog} from "@/components/delete-organization-alert-dialog";

export default function OrganizationSettingsPage({organization}: { organization: Organization }) {
    const {data: session} = useSession()

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

                        <DeleteOrganizationAlertDialog organization={organization} />

                    </div>
                </div>

                {/*<DeleteOrganizationForm organization={organization}/>*/}

            </div>
        </main>
    )
}
