import { ScrollArea } from "@comend/components/ui/scroll-area";
import { cn } from "@comend/lib/utils";
import { ExternalAttachment, ExternalContact } from "@prisma/client";
import { ExternalLink, LinkIcon, Mail } from "lucide-react";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { PropertyBadge } from "@comend/components/property-badge";
import { Badge } from "@comend/components/ui/badge";
import { DialogHeader, DialogTitle } from "@comend/components/ui/dialog";
import { Separator } from "@comend/components/ui/separator";
import { CaretAccordion } from "@comend/components/ui/carret-accordion";
import { BIOSAMPLE_TYPE_OPTIONS, QUANTITY_OPTIONS } from "@comend/lib/types";

export const BiosampleDetails = ({biosample}: { biosample: any }) => {
    return (
        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 mt-2"} type={"always"}>
            <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">{biosample?.id}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                    {biosample?.types && BIOSAMPLE_TYPE_OPTIONS.filter(option => biosample.types.includes(option.value)) && (
                        BIOSAMPLE_TYPE_OPTIONS.filter(option => biosample.types.includes(option.value)).map(type => (
                            <Badge variant={"lightBlue"} className="w-fit">{type.label}</Badge>
                        ))
                    )}
                </div>

                <div className="grid gap-4 grid-cols-2">
                    <PropertyBadge>
                        <b>Donor:</b>
                        <img className="size-4 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${biosample?.donorId}`} alt="User Avatar" />
                        <p>{biosample?.donorId || '--'}</p>
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Gene:</b>
                        {biosample?.gene ? (<Badge variant={'teal'}>{biosample?.gene?.symbol}</Badge>) : (<p>{'--'}</p>)}
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Stored with:</b>
                        <p>{biosample?.company?.title || biosample?.institution?.name || '--'}</p>
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Genotype:</b>
                        <p>{biosample?.genotypem || '--'}</p>
                    </PropertyBadge>

                    <PropertyBadge>
                        <b>Quantity:</b>
                        {(biosample?.quantity && biosample?.quantityUnit) 
                            ? (<p>{`${biosample.quantity} ${QUANTITY_OPTIONS.find(option => option.value === biosample.quantityUnit)?.label}`}</p>) 
                            : (<p>{'--'}</p>)}
                    </PropertyBadge>
                </div>

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

                <CaretAccordion 
                    title={'Notes'}
                    content={
                        <p className="text-sm">{biosample?.description || '--'}</p>
                    }
                />

                <Separator />

                <div className="flex flex-col gap-2 w-full">
                    <h3 className="text-lg font-semibold">Contacts</h3>
                    {biosample?.contacts && biosample.contacts?.length > 0 
                        ? (
                            biosample?.contacts?.map((contact: ExternalContact) => (
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
                            ))
                        )
                        : (<p>{'--'}</p>)
                    }
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <h3 className="text-lg font-semibold">Attachments</h3>
                    {biosample?.attachments && biosample.attachments?.length > 0 
                        ? (
                            biosample?.attachments?.map((attachment: ExternalAttachment) => (
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
                            ))
                        ) 
                        : (<p>{'--'}</p>)
                    }
                </div>
            </div>
        </ScrollArea>
    )
}