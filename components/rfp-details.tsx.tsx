import { Prisma } from "@prisma/client"
import { ExternalAttachmentField } from "./external-attachment-field"
import { ExternalContactField } from "./external-contact-field"
import { Button } from "./ui/button"
import {
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { FaArrowUpRightFromSquare, FaTrash } from "react-icons/fa6"
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

type RFPType = Prisma.RFPGetPayload<{}>

type MilestoneType = Prisma.MilestoneGetPayload<{
    include: {
        node: true,
        contacts: true
    }
}>

const Details = ({ rfp }: { rfp: MilestoneType }) => {
    if (rfp.startDate && rfp.budget) {
        return (
            <p className="w-full text-wrap break-words">{rfp.startDate.toDateString()}  &bull; {`$ ${rfp.budget.toLocaleString()} USD`}</p>
        )
    } else if (rfp.budget) {
        return (
            <p className="w-full text-wrap break-words">{`$ ${rfp.budget.toLocaleString()} USD`}</p>
        )
    } else if (rfp.startDate) {
        return (
            <p className="w-full text-wrap break-words">{rfp.startDate.toDateString()}</p>
        )
    }

    return (
        <p>No details provided for this RFP</p>
    )
}

export function RFPDetails({ rfp, isPublic }: { rfp: MilestoneType, isPublic: boolean }) {
    return (
        <HoverCard
            key={rfp?.id}
            openDelay={0}
            closeDelay={0}
        >
            {/* <HoverCardTrigger asChild> */}
                <a href={isPublic ? `/research-plan?milestone=${rfp?.id}&view=flow` : `/app/research-plan?milestone=${rfp?.nodeId || rfp?.node?.id}`}>
                    <li
                        key={rfp?.id}
                        className="w-full flex items-center justify-between space-x-4 py-2 text-wrap"
                    >
                        <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                            <div className="flex items-center gap-x-3">
                                <h2 className="min-w-0 text-sm font-semibold">
                                    <span className="truncate">{rfp?.title}</span>
                                </h2>
                            </div>
                            <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400 text-wrap">
                                <Details rfp={rfp} />
                            </div>
                        </div>
                    </li>
                </a>
            {/* </HoverCardTrigger> */}
            {/* <HoverCardContent
                side="top"
                className="w-80"
            >
                <div className="w-full flex justify-between space-x-4">
                    <div className="w-full space-y-1">
                        <h4 className="text-sm font-semibold">{rfp?.title}</h4>
                        <p className="w-full text-sm text-wrap break-words">
                            {rfp?.description}
                        </p>
                    </div>
                </div>
            </HoverCardContent> */}
        </HoverCard>


        // <>
        //     <Card>
        //         <CardHeader>
        //             <CardTitle>{asset.name}</CardTitle>
        //             <CardDescription>{asset.description}</CardDescription>
        //         </CardHeader>

        //         <CardContent className="flex flex-col gap-4">

        //             {asset.contacts && asset.contacts.length > 0 && (
        //                 <div className="flex flex-col gap-4">
        //                     <Separator />
        //                     <h2 className="font-semibold text-xl">{`Contacts`}</h2>
        //                     <ol>
        //                         {asset.contacts.map((contact: any, index: number) => (
        //                             <li>
        //                                 {`${index + 1}. ${contact.name || contact.email}`}
        //                             </li>
        //                         ))}
        //                     </ol>
        //                 </div>
        //             )}

        //             {asset.attachments && asset.attachments.length > 0 && (
        //                 <div className="flex flex-col gap-4">
        //                     <Separator />
        //                     <h2 className="font-semibold text-xl">{`Attachments`}</h2>
        //                     <ol>
        //                         {asset.attachments.map((attachment: any, index: number) => (
        //                             <li>
        //                                 <a
        //                                     href={attachment.link}
        //                                     className="flex flex-row gap-2 items-center"
        //                                 >
        //                                     {`${index + 1}. ${attachment.name || attachment.link}`}
        //                                     <FaArrowUpRightFromSquare size={15} />
        //                                 </a>
        //                             </li>
        //                         ))}
        //                     </ol>
        //                 </div>
        //             )}
        //         </CardContent>
        //     </Card>
        // </>
    )
}