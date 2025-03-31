import {getSession} from "@/lib/auth";
import prisma from "@/lib/prisma"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditAssetForm } from "@/components/edit-asset-form";

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
            <div className="px-4 w-full max-w-7xl my-4 mx-auto gap-4">
                <main className="col-span-4 flex flex-col items-center">
                    <div>
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
                                        Edit or Create Asset
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`Make changes to or create your asset here. Click save when you're done.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <EditAssetForm assetData={{}} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    {assets.map((asset) => (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    {asset.title}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
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
