import React from "react"
import NoOrganization from "~web/components/no-organization"
import {getSession} from "@comend/lib/auth"
import { PrivateRFPsPage } from "~web/components/private-rfps-page"
import prisma from "@comend/lib/prisma"
import { RFPSort } from "@comend/lib/utils"

export default async function RFPsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />

    const rfps = await prisma.rFP.findMany({
        where: { organizationId: orgId },
        orderBy: { 
            createdAt: "desc" 
        },
        include: {
            contacts: true,
            attachments: true,
            milestones: {
                include: {
                    milestone: true
                }
            }
        },
    })

    return <PrivateRFPsPage initialRFPs={RFPSort(rfps)}/>
}
