import { Prisma } from "@prisma/client"
import { HoverCard } from "@/components/ui/hover-card";
import { PrivateBadge } from "./private-badge"
import { TypeBadge } from "./type-badge"
import { PublicBadge } from "./public-badge"

type RFPType = Prisma.RFPGetPayload<{}>

type MilestoneType = Prisma.MilestoneGetPayload<{
    include: {
        node: true,
        contacts: true,
        attachments: true,
        types: { include: { milestoneType: true } }
        assets: { include: { asset: true } },
        rfps: { include: { rfp: true } }
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

export function RFPDetails({ rfp, isPublic }: { rfp: MilestoneType, isPublic?: boolean }) {
    return (
        <HoverCard
            key={rfp?.id}
            openDelay={0}
            closeDelay={0}
        >
            <a href={isPublic ? `/research-plan?milestone=${rfp?.id}` : `/app/research-plan?milestone=${rfp?.nodeId || rfp?.node?.id}`}>
                <li
                    key={rfp?.id}
                    className="w-full flex items-center justify-between space-x-4 py-2 text-wrap"
                >
                    <div className="flex flex-col justify-between min-w-0 w-full">
                        <div className="flex items-center gap-x-3 w-full">
                            <h2 className="text-sm font-semibold truncate text-wrap break-words">
                                {rfp?.title}
                            </h2>
                            {rfp?.private ? <PrivateBadge iconOnly={true}/> : (!isPublic ? <PublicBadge iconOnly={true}/> : undefined)}
                        </div>
                        <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400 text-wrap">
                            <Details rfp={rfp} />
                        </div>
                    </div>
                </li>
            </a>
        </HoverCard>
    )
}