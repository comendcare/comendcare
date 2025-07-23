import { Badge } from "@comend/components/ui/badge"

export const MilestoneTypeBadge = ({label}: {label: string | undefined}) => {
    return (
        <Badge variant={"blue"} className="whitespace-nowrap">
            {label || "No type"}
        </Badge>
    )
}
