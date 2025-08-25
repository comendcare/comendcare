"use client";

import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";
import {DeleteOrganizationAlertDialog} from "@comend/components/delete-organization-alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import {Button} from "@comend/components/ui/button";
import {Table, Braces} from "lucide-react"
import {useTransition} from "react";
import {exportOrganizationAsCSV, exportOrganizationAsJSON} from "~web/lib/export";
import {toast} from "sonner";
import JSZip from "jszip";


export default function OrganizationSettingsPage({organization}: { organization: Organization }) {
    const {data: session} = useSession()
    const [isPending, startTransition] = useTransition();

    const handleExportJSON = () => {
        startTransition(async () => {
            try {
                const data = await exportOrganizationAsJSON(organization.id);
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], {type: "application/json;charset=utf-8"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `organization-${organization.id}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (error) {
                toast.error("An error occurred while updating your profile.");
                console.log(error)
            }
        });
    };

    const handleExportCSV = () => {
        startTransition(async () => {
            try {
                const result = await exportOrganizationAsCSV(organization.id);
                const { files } = result;

                // Create a new zip archive
                const zip = new JSZip();

                // Add each CSV file into the archive
                for (const [filename, csv] of Object.entries(files)) {
                    zip.file(filename, csv);
                }

                // Generate the zip blob
                const content = await zip.generateAsync({ type: "blob" });

                // Trigger download
                const url = URL.createObjectURL(content);
                const a = document.createElement("a");
                a.href = url;
                a.download = `organization-${organization.id}.zip`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (error) {
                toast.error("An error occurred while exporting your organization data.");
                console.error(error);
            }
        });
    };

    const disabled = session?.user?.membership?.role !== "owner";

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

                <div className={`${disabled ? "mt-8 opacity-50 cursor-not-allowed space-y-4" : "space-y-4"}`}>
                    <div
                        className="w-full border rounded-md p-8 border-red-200 flex items-center justify-between gap-4">
                        <div className="flex flex-grow flex-col">
                            <div className="text-sm font-medium leading-6 text-gray-900">
                                Delete Organization
                            </div>
                            <div className="text-sm text-gray-500">
                                This will delete all memberships, roadmaps, and tasks from this organization.
                                This organization will then be permanently deleted.
                            </div>
                        </div>

                        <DeleteOrganizationAlertDialog organization={organization}/>
                    </div>
                </div>

                <div className={`${disabled ? "mt-8 opacity-50 cursor-not-allowed space-y-4" : "space-y-4"}`}>
                    <div
                        className="w-full border rounded-md p-8 border-red-200 flex items-center justify-between gap-4">
                        <div className="flex flex-grow flex-col">
                            <div className="text-sm font-medium leading-6 text-gray-900">
                                Export Organization Data
                            </div>
                            <div className="text-sm text-gray-500">
                                {`This will export all your organization's profile data, research plans, tools, RFPs, and all other content into a file format of your choice.`}
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="destructive" disabled={disabled || isPending}>
                                    {isPending ? "Exporting..." : "Export Data"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (disabled) return;
                                        handleExportJSON();
                                    }}
                                >
                                    <Braces className="h-4 w-4"/>
                                    JSON
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (disabled) return;
                                        handleExportCSV();
                                    }}
                                >
                                    <Table className="h-4 w-4"/>
                                    CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </main>
    )
}
