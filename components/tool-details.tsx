import { Prisma } from "@prisma/client"
import {HoverCard} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils"
import { PrivateBadge } from "./private-badge"
import { TypeBadge } from "./type-badge"
import { PublicBadge } from "./public-badge"

type ToolType = Prisma.ToolGetPayload<{ 
    include: { 
        contacts: { 
            select: { name: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    } 
}>
type ContactType = ToolType['contacts'][0]
type AttachmentType = ToolType['attachments'][0]
type MilestoneType = Prisma.MilestoneGetPayload<{
    include: {
        node: true,
        contacts: true,
        attachments: true,
        types: { include: { milestoneType: true } }
        tools: { include: { tool: true } },
        rfps: { include: { rfp: true } }
    }
}>

export function ToolDetails({ tool, isPublic }: { tool: MilestoneType, isPublic?: boolean }) {
    return (
        <HoverCard
            key={tool?.id}
            openDelay={0}
            closeDelay={0}
        >
            {/* <HoverCardTrigger asChild> */}
                <a href={isPublic ? `/research-plan?milestone=${tool?.id}` : `/app/research-plan?milestone=${tool?.nodeId || tool?.node?.id}`}>
                    <li
                        key={tool?.id}
                        className="w-full flex items-center justify-between space-x-4 py-2"
                    >
                        <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                            <div className="flex items-center gap-x-3 w-full">
                                <h2 className="text-sm font-semibold truncate text-wrap break-words">
                                    {tool?.title}
                                </h2>
                                {tool?.private ? <PrivateBadge iconOnly={true}/> : (!isPublic ? <PublicBadge iconOnly={true}/> : undefined)}
                            </div>
                            {tool?.contacts && tool.contacts.length > 0 ? (
                                <div className={"w-full mt-2 flex items-center gap-x-2.5 text-sm text-gray-400 text-wrap"}>
                                    <ul className={cn("w-full", tool.contacts.length > 1 ? "list-disc pl-6": "")}>
                                        {tool.contacts.map((contact, index) => {
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
                                    <p>No contacts provided for this tool</p>
                                </div>
                            )}
                        </div>
                    </li>
                </a>
        </HoverCard>
    )
}