import { FaBullhorn, FaFileLines, FaStar } from "react-icons/fa6"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

export const TypeBadge = ({type, iconOnly = false, className}: {
    type: string,
    iconOnly?: boolean,
    className?: string
}) => {
    if (type === "ASSET") {
        return (
            <Badge variant="outline"
                   className={cn("h-8 text-sm flex gap-2 border-asset-foreground text-asset-foreground bg-asset", className)}>
                <FaStar/>
                {!iconOnly && "Asset"}
            </Badge>
        )
    }

    if (type === "PROJECT") {
        return (
            <Badge variant="outline"
                   className={cn("h-8 text-sm flex gap-2 border-project-foreground text-project-foreground bg-project", className)}>
                <FaFileLines/>
                {!iconOnly && "Project"}
            </Badge>
        )
    }

    if (type === "RFP") {
        return (
            <Badge variant="outline" className={cn("h-8 text-sm flex gap-2 border-rfp-foreground text-rfp-foreground bg-rfp", className)}>
                <FaBullhorn/>
                {!iconOnly && "RFP"}
            </Badge>
        )
    }

    return
}
