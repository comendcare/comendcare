import { ScrollArea } from "@comend/components/ui/scroll-area";
import { cn, formatDateUTC, formatMoney } from "@comend/lib/utils";
import { ExternalAttachment, ExternalContact } from "@prisma/client";
import { FileText, LinkIcon, Mail, Workflow } from "lucide-react";
import Link from "next/link";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { PropertyBadge } from "@comend/components/property-badge";
import { Badge } from "@comend/components/ui/badge";
import { Button } from "@comend/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@comend/components/ui/dialog";
import { Separator } from "@comend/components/ui/separator";
import { CaretAccordion } from "ui/carret-accordion";

export const ClinicalDatasetDetails = ({clinicalDataset}: { clinicalDataset: any }) => {
    return (
        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 mt-2"} type={"always"}>
            {/* <Scrollbar /> */}
            <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">{clinicalDataset?.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4 ">
                {/* <RFPStatusBadge status={status} /> */}
                
                <div className="flex gap-4">
                {/* <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words grow-2">
                    {Array.isArray(clinicalDataset.openTo) && clinicalDataset.openTo.length > 0 && (
                        <li>
                            <PropertyBadge>
                                <b>Open to:</b>
                                {clinicalDataset.openTo
                                    .map((option: string) => {
                                        switch (option) {
                                            case "CRO":
                                                return "Service providers";
                                            case "ACADEMIC":
                                                return "Academics";
                                            default:
                                                return option;
                                        }
                                    })
                                    .join(", ")}
                            </PropertyBadge>
                        </li>
                    )}

                    {clinicalDataset.budget && (
                        <li>
                            <PropertyBadge>
                                <p><b>Budget: </b> ${formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {clinicalDataset.startDate && (
                        <li>
                            <PropertyBadge>
                                <b>Opens: </b>{formatDateUTC(rfp.startDate)}
                            </PropertyBadge>
                        </li>
                    )}

                    {clinicalDataset.endDate && (
                        <li>
                            <PropertyBadge>
                                <b>Due: </b>{formatDateUTC(rfp.endDate)}
                            </PropertyBadge>
                        </li>
                    )}
                </ul> */}
                    {/* {(clinicalDataset?.contacts && clinicalDataset?.contacts?.length > 0) && (
                        <div className="grow-1">
                        <Button 
                            variant="cta"
                            className="ml-auto font-normal"
                            asChild
                        >
                            <Link href={`mailto:${clinicalDataset?.contacts[0].email}`}>
                                <Mail className="h-4 w-4 min-h-4 min-w-4"/>
                                Contact
                            </Link>
                        </Button>
                        </div>
                    )} */}
                </div>

                {(clinicalDataset?.milestones && clinicalDataset?.milestones.length > 0) && (
                    <div className="border-l-2 border-purple-200 pl-2 space-y-2">
                        <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Workflow className="h-4 w-4 min-w-4 text-purple-900" />
                            <span className="text-purple-900 text-nowrap">Projects</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {clinicalDataset.milestones.map((project: any) => (
                                <Badge className="font-normal" variant={"purple"}>
                                    <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                                    {project.milestone.title}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <DialogDescription className="text-sm text-muted-foreground">{clinicalDataset?.description}</DialogDescription>

                <Separator />

                {clinicalDataset?.organization && (
                    <a
                        href={`http://${clinicalDataset.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <ProfilePhoto img={clinicalDataset.organization.image} name={clinicalDataset.organization.name} className="h-9 w-9 -mt-1"/>
                            <p className="text-lg font-semibold underline">{clinicalDataset.organization.name}</p>
                        </div>
                    </a>
                )}

                <Separator />

                {/* {clinicalDataset.eligibility && (
                    <CaretAccordion 
                        title={'Notes'}
                        content={
                            <p className="text-sm">{clinicalDataset.eligibility}</p>
                        }
                    />
                )} */}

                {/* {rfp.instructions && (
                    <CaretAccordion 
                        title={'Instructions'}
                        content={
                            <p className="text-sm">{rfp.instructions}</p>
                        }
                    />
                )}

                {rfp.evaluationProcess && (
                    <CaretAccordion 
                        title={'Evaluation process'}
                        content={
                            <p className="text-sm">{rfp.evaluationProcess}</p>
                        }
                    />
                )} */}

                {((clinicalDataset?.contacts && clinicalDataset.contacts.length > 0) || (clinicalDataset?.attachments && clinicalDataset.attachments.length > 0)) && <Separator />}

                {clinicalDataset?.contacts && clinicalDataset.contacts.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        {clinicalDataset?.contacts?.map((contact: ExternalContact) => (
                            <span className="flex items-center gap-2 text-wrap w-full text-sm">
                                <Mail className="mt-1 h-4 w-4 min-h-4 min-w-4"/>
                                <a
                                    className={cn(contact?.email && "underline")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    href={contact?.email ? `mailto:${contact?.email}` : undefined}
                                >
                                    {contact?.name ||
                                        contact?.email ||
                                        contact?.affiliation || "No primary contacts"}
                                </a>
                            </span>
                        ))}
                    </div>
                )}

                {clinicalDataset?.attachments && clinicalDataset.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Attachments</h3>
                        {clinicalDataset?.attachments?.map((attachment: ExternalAttachment) => (
                            <span className="flex items-start gap-2 text-wrap w-full text-sm">
                                <LinkIcon className="mt-1 h-4 w-4 min-h-4 min-w-4"/>
                                <a
                                    className={cn(
                                        attachment?.link && "underline", 
                                        "text-wrap w-full",
                                        // allow text break in middle of word for long links
                                        !attachment.name && attachment.link && "break-all"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    href={attachment?.link}
                                >
                                    {attachment?.name || attachment?.link || "No attachments"}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}