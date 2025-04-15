import {getSession} from "@/lib/auth";
import prisma from "@/lib/prisma"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { AssetBulkImportDialog } from "@/components/asset-bulk-import-dialog";
import { AssetsDataTable } from "@/components/assets-data-table/assets-data-table";
import { columns } from "@/components/assets-data-table/assets-data-columns";
import Image from "next/image";
import { NewAssetDialog } from "@/components/edit-asset-dialog";

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
            },
            orderBy: [{ createdAt: "desc" }]
        })

        // Existing verified organization rendering logic
        return (
            <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto">
                <div className="flex gap-2 w-full justify-end">
                        <NewAssetDialog iconOnly={true} numAssetsPinned={assets.filter(asset => asset.pinned).length}/>
                    <AssetBulkImportDialog />
                </div>

                {assets.length <= 0 && (
                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                        <h1 className="font-cal text-4xl">You do not have any Assets</h1>
                        <Image
                            alt="No Assets"
                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                            width={300}
                            height={300}
                        />
                        <p className="text-lg text-stone-500">
                            An asset is a milestone outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                        </p>
                        <NewAssetDialog numAssetsPinned={assets.filter(asset => asset.pinned).length}/>
                    </div>
                )}
                {assets.length > 0 && (
                    <AssetsDataTable data={assets} columns={columns}/>
                )}
            </main>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}