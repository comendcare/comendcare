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
import { cn } from "@/lib/utils"
import { PrivateBadge } from "./private-badge"

type AssetType = Prisma.AssetGetPayload<{ 
    include: { 
        contacts: { 
            select: { name: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    } 
}>
type ContactType = AssetType['contacts'][0]
type AttachmentType = AssetType['attachments'][0]
type MilestoneType = Prisma.MilestoneGetPayload<{
    include: {
        node: true,
        contacts: true
    }
}>

export function AssetDetails({ asset, isPublic }: { asset: MilestoneType, isPublic: boolean }) {
    return (
        <HoverCard
            key={asset?.id}
            openDelay={0}
            closeDelay={0}
        >
            {/* <HoverCardTrigger asChild> */}
                <a href={isPublic ? `/research-plan?milestone=${asset?.id}` : `/app/research-plan?milestone=${asset?.nodeId || asset?.node?.id}`}>
                    <li
                        key={asset?.id}
                        className="w-full flex items-center justify-between space-x-4 py-2"
                    >
                        <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                            <div className="flex items-start gap-x-3 w-full">
                                <h2 className="text-sm font-semibold truncate text-wrap break-words">
                                    {asset?.title}
                                </h2>
                                {asset.private && <PrivateBadge />}
                            </div>
                            {asset?.contacts && asset.contacts.length > 0 ? (
                                <div className={"w-full mt-2 flex items-center gap-x-2.5 text-sm text-gray-400 text-wrap"}>
                                    <ul className={cn("w-full", asset.contacts.length > 1 ? "list-disc pl-6": "")}>
                                        {asset.contacts.map((contact, index) => {
                                            if (contact.name && contact.email) {
                                                return (
                                                    <li key={index} className="w-full">
                                                    <p className="w-full text-wrap break-words">{contact.name} &bull; {contact.email}</p>
                                                    </li>
                                                )
                                            } else if (contact.name) {
                                                return (
                                                    <li key={index} className="w-full">
                                                    <p className="w-full text-wrap break-words">{contact.name}</p>
                                                    </li>
                                                )
                                            } else if (contact.email) {
                                                return (
                                                    <li key={index} className="w-full">
                                                    <p className="w-full text-wrap break-words">{contact.email}</p>
                                                    </li>
                                                )
                                            }
                                        })}
                                    </ul>
                                </div>
                            ): (
                                <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                                    <p>No contacts provided for this asset</p>
                                </div>
                            )}
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
                        <h4 className="text-sm font-semibold">{asset?.title}</h4>
                        <p className="w-full text-sm text-wrap break-words">
                            {asset?.description}
                        </p>
                    </div>
                </div>
            </HoverCardContent> */}
        </HoverCard>
    )
}