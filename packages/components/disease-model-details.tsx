import { ScrollArea } from "@comend/components/ui/scroll-area";
import { cn, formatDateUTC, formatMoney } from "@comend/lib/utils";
import { ExternalAttachment, ExternalContact } from "@prisma/client";
import { ExternalLink, FileText, LinkIcon, Mail, Workflow } from "lucide-react";
import Link from "next/link";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { PropertyBadge } from "@comend/components/property-badge";
import { Badge } from "@comend/components/ui/badge";
import { Button } from "@comend/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@comend/components/ui/dialog";
import { Separator } from "@comend/components/ui/separator";
import { CaretAccordion } from "@comend/components/ui/carret-accordion";
import { DISEASE_MODEL_TYPE_OPTIONS } from "@comend/lib/types";

export const DiseaseModelDetails = ({diseaseModel}: { diseaseModel: any }) => {

    return (
        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 mt-2"} type={"always"}>
            <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">{diseaseModel?.id}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4 ">
                <div className="flex gap-4">
                    {diseaseModel?.types && DISEASE_MODEL_TYPE_OPTIONS.filter(option => diseaseModel.types.includes(option.value)) && (
                        DISEASE_MODEL_TYPE_OPTIONS.filter(option => diseaseModel.types.includes(option.value)).map(type => (
                            <Badge variant={"lightBlue"} className="w-fit">{type.label}</Badge>
                        ))
                    )}
                </div>

                <div className="grid gap-4 grid-cols-2">
                    <PropertyBadge>
                        <b>Strain:</b>
                        <p>{diseaseModel?.strain}</p>
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Gene:</b>
                        {diseaseModel?.gene && (<Badge variant={'teal'}>{diseaseModel?.gene?.symbol || ''}</Badge>)}
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Stored with:</b>
                        <p>{diseaseModel?.company?.title || diseaseModel?.institution?.name}</p>
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Genotype:</b>
                        <p>{diseaseModel?.genotype}</p>
                    </PropertyBadge>
                </div>

                <Separator />

                {diseaseModel?.organization && (
                    <a
                        href={`http://${diseaseModel.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <ProfilePhoto img={diseaseModel.organization.image} name={diseaseModel.organization.name} className="h-9 w-9 -mt-1"/>
                            <p className="text-lg font-semibold underline">{diseaseModel.organization.name}</p>
                        </div>
                    </a>
                )}

                <Separator />

                {diseaseModel?.description && (
                    <CaretAccordion 
                        title={'Notes'}
                        content={
                            <p className="text-sm">{diseaseModel.description}</p>
                        }
                    />
                )}

                {((diseaseModel?.contacts && diseaseModel.contacts.length > 0) || (diseaseModel?.attachments && diseaseModel.attachments.length > 0)) && <Separator />}

                {diseaseModel?.contacts && diseaseModel.contacts.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        {diseaseModel?.contacts?.map((contact: ExternalContact) => (
                            <span className="flex items-center gap-2 text-wrap w-full text-sm">
                                <Mail className="h-4 w-4 min-h-4 min-w-4"/>
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

                {diseaseModel?.attachments && diseaseModel.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Attachments</h3>
                        {diseaseModel?.attachments?.map((attachment: ExternalAttachment) => (
                            <span className="flex items-center gap-2 text-wrap w-full text-sm">
                                <LinkIcon className="h-4 w-4 min-h-4 min-w-4"/>
                                <a
                                    className={cn(
                                        attachment?.link && "underline", 
                                        "text-wrap",
                                        // allow text break in middle of word for long links
                                        !attachment.name && attachment.link && "break-all"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    href={attachment?.link}
                                    target="_blank"
                                >
                                    {attachment?.name || attachment?.link || "No attachments"}
                                </a>
                                <ExternalLink className="h-4 w-4 min-h-4 min-w-4"/>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}