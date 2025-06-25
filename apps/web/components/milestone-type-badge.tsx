import { Badge } from "@comend/components/ui/badge"

export const MilestoneTypeBadge = ({label}: {label: string | undefined}) => {
    return (
        <Badge variant={"blue"}>
            {label || "No type"}
        </Badge>
    )
}
