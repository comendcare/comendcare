import { Badge } from "./ui/badge"

export const MilestoneTypeBadge = ({label}: {label: string | undefined}) => {
    return (
        <Badge variant={"milestoneType"}>
            {label || "No type"}
        </Badge>
    )
}