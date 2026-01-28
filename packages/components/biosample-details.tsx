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
import { CaretAccordion } from "@comend/components/ui/carret-accordion";
import { QUANTITY_OPTIONS } from "@comend/lib/types";

export const BiosampleDetails = ({biosample}: { biosample: any }) => {

    return (
        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 mt-2"} type={"always"}>
            {/* <Scrollbar /> */}
            <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">{biosample?.id}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
                {/* <div className="flex gap-2 items-center min-w-[110px] text-nowrap">
                    <img className="size-8 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`} alt="User Avatar" />
                    <p>{biosample.donorId}</p>
                </div> */}
                {biosample?.quantity && biosample?.quantityUnit && (
                    <Badge variant="green" className="w-fit">{`${biosample.quantity} ${QUANTITY_OPTIONS.find(option => option.value === biosample.quantityUnit)?.label}`}</Badge>
                )}

                {/* <PropertyBadge>
                    <b>Open to:</b>
                    {rfp.openTo
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
                </PropertyBadge> */}

                <Separator />

                {biosample?.organization && (
                    <a
                        href={`http://${biosample.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <ProfilePhoto img={biosample.organization.image} name={biosample.organization.name} className="h-9 w-9 -mt-1"/>
                            <p className="text-lg font-semibold underline">{biosample.organization.name}</p>
                        </div>
                    </a>
                )}

                <Separator />

                {biosample?.description && (
                    <CaretAccordion 
                        title={'Notes'}
                        content={
                            <p className="text-sm">{biosample.description}</p>
                        }
                    />
                )}

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

                {((biosample?.contacts && biosample.contacts.length > 0) || (biosample?.attachments && biosample.attachments.length > 0)) && <Separator />}

                {biosample?.contacts && biosample.contacts.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        {biosample?.contacts?.map((contact: ExternalContact) => (
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

                {biosample?.attachments && biosample.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Attachments</h3>
                        {biosample?.attachments?.map((attachment: ExternalAttachment) => (
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