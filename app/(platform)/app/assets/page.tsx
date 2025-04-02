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
            <div className="px-4 w-full my-4 mx-auto gap-4">
                <main className="col-span-4 flex flex-col items-center gap-4">
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
                    {assets.map((asset) => (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    {asset.title}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Edit an Asset
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`Edit your Asset here. Click save when you're done.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <EditAssetForm assetData={asset} />
                            </DialogContent>
                        </Dialog>
                    ))}
                </main>
            </div>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
