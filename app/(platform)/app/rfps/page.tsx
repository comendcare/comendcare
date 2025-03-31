import {getSession} from "@/lib/auth";
import prisma from "@/lib/prisma"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditRFPForm } from "@/components/edit-rfp-form";

export default async function RFPsPage() {
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
        let rfps = await prisma.rFP.findMany({
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
                                    Add an RFP
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Create an RFP
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`Create your RFP here. Click save when you're done.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <EditRFPForm rfpData={{}}/>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {rfps.map((rfp) => (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    {rfp.title}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Edit an RFP
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`Edit your RFP here. Click save when you're done.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <EditRFPForm rfpData={rfp}/>
                            </DialogContent>
                        </Dialog>
                    ))}
                </main>
            </div>
        );
    } else {
        return (
            <NoOrganization/>
        );
    }
}
