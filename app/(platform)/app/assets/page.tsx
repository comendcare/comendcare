import {getSession} from "@/lib/auth";
import prisma from "@/lib/prisma"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditAssetForm } from "@/components/edit-asset-form";
import { AssetBulkImportDialog } from "@/components/asset-bulk-import-dialog";
import { AssetsDataTable } from "@/components/assets-data-table/assets-data-table";
import { columns } from "@/components/assets-data-table/assets-data-columns";

export default async function AssetsPage() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId)
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) {
        let assets = await prisma.asset.findMany({
            where: {organizationId: organization?.id},
            include: {
                contacts: true,
                attachments: true,
                milestones: {
                    include: {
                        milestone: true
                    }
                }
            }
        })

        // Existing verified organization rendering logic
        return (
            <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto">
                <div className="flex gap-2 w-full justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus />
                                Add an asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Create an Asset
                                </DialogTitle>
                                <DialogDescription>
                                    {`Create your Asset here. Click save when you're done.`}
                                </DialogDescription>
                            </DialogHeader>
                            <EditAssetForm assetData={{}} />
                        </DialogContent>
                    </Dialog>

                    <AssetBulkImportDialog />
                </div>
                <AssetsDataTable data={assets} columns={columns}/>
            </main>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
