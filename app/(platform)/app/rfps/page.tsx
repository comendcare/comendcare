import {getSession} from "@/lib/auth";
import prisma from "@/lib/prisma"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, FileText, GraduationCap, Link, Plus, Star, User } from "lucide-react";
import { EditRFPForm } from "@/components/edit-rfp-form";
import { RFPBulkImportDialog } from "@/components/rfp-bulk-import-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateBadge } from "@/components/private-badge";
import { DateView } from "@/components/miletone-date-view";
import Image from "next/image"
import { RFP } from "@/lib/types";
import { RFPCard } from "@/components/rfp-card";

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
            <main className="flex gap-4 flex-col w-full max-w-7xl p-4 h-full items-center mx-auto">
                <div className="flex gap-2 w-full justify-end">
                    <NewRFPDialog />
                    <RFPBulkImportDialog />
                </div>

                {rfps.length <= 0 && (
                    <div className="h-full w-full flex flex-col justify-center items-center gap-4">
                        <h1 className="font-cal text-4xl">You do not have any RFPs</h1>
                        <Image
                            alt="No RFPs"
                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                            width={300}
                            height={300}
                        />
                        <p className="text-lg text-stone-500">
                            You do not have any RFPs yet. Create one to get started.
                        </p>
                        <NewRFPDialog />
                    </div>
                )}
                {rfps.length > 0 && (
                    <div className={"w-full grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"}>
                        {rfps.map((rfp) => (
                            <Dialog>
                                <DialogTrigger>
                                    <RFPCard rfp={rfp} />
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
                    </div>
                )}

            </main>
        );
    } else {
        return (
            <NoOrganization/>
        );
    }
}

const NewRFPDialog = ({iconOnly = false}: {iconOnly?: boolean}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"cta"}>
                    <Plus />
                    {!iconOnly && `Create an RFP`}
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
    )
}