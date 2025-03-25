import { Badge } from "./ui/badge"

export const MilestoneTypeBadge = ({label}: {label: string | undefined}) => {
    return (
        <Badge variant={"secondary"} className="text-sm h-7 rounded-md px-2 py-1 font-medium">
            {label || "No type"}
        </Badge>
    )
}