import { Badge } from "./ui/badge"

export const MilestoneTypeBadge = ({label}: {label: string | undefined}) => {
    return (
        <Badge variant={"blue"}>
            {label || "No type"}
        </Badge>
    )
}