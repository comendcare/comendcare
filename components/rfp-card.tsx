import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateBadge } from "@/components/private-badge";
import { DateView } from "@/components/miletone-date-view";
import { User } from "lucide-react";

export const RFPCard = ({rfp}: {rfp: any}) => {
    return (
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

                    {(rfp.contacts || []).map((contact: any, index: number) => {
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
    )
}