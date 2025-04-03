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

                    <RFPBulkImportDialog />
                </div>

                {/* <ScrollArea className="p-4 w-full"> */}
                    <div className={"w-full grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"}>
                        {rfps.map((rfp) => (
                            <Dialog>
                                <DialogTrigger>
                                    <Card className="h-full w-full text-left flex flex-col justify-between">
                                        <CardHeader className="gap-2">
                                            <div className="bg-blue-light h-32 -mt-6 -mx-6 rounded-t-md" />
                                            <CardTitle>{rfp.title} {rfp.private && <PrivateBadge iconOnly className="ml-auto pl-auto"/>}</CardTitle>
                                            <CardDescription className="line-clamp-3">{rfp.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                                                {/* {(rfp.milestones || []).map((milestone, index) => {
                                                    return (
                                                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                                                            <FileText className="h-4 w-4"/>
                                                            <p className="w-[90%] text-wrap break-words">{milestone.milestone.title}</p>
                                                        </li>
                                                    )
                                                })} */}

                                                {(rfp.startDate || rfp.endDate) && (
                                                    <li className="border-l-2 border-gray-300 pl-2">
                                                        <DateView startDate={rfp.startDate || undefined} endDate={rfp.endDate || undefined} startLabel="Request Opens:" endLabel="Deadline for Proposals:"/>
                                                    </li>
                                                )}

                                                {(rfp.contacts || []).map((contact, index) => {
                                                    return (
                                                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                                                            <User className="h-4 w-4"/>
                                                            <p className="w-[90%] text-wrap break-words">
                                                                {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                                                            </p>
                                                        </li>
                                                    )
                                                })}

                                                {/* {(rfp.attachments || []).map((attachment, index) => {
                                                    return (
                                                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                                                            <Link className="h-4 w-4"/>
                                                            <a className="w-[90%] text-wrap break-words" href={attachment.link || "#"}>{attachment.name || attachment.link}</a>
                                                        </li>
                                                    )
                                                })} */}
                                                
                                                {/* {rfp.openTo && rfp.openTo.includes('ACADEMIC') && (
                                                    <li className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                                                        <GraduationCap className="h-4 w-4"/>
                                                        <p>Open to Academics</p>
                                                    </li>
                                                )}

                                                {rfp.openTo && rfp.openTo.includes('CRO') && (
                                                    <li className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                                                        <Building className="h-4 w-4"/>
                                                        <p>Open to CROs</p>
                                                    </li>
                                                )} */}
                                            </ul>
                                        </CardContent>
                                    </Card>
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
                {/* </ScrollArea> */}
            </main>
        );
    } else {
        return (
            <NoOrganization/>
        );
    }
}
