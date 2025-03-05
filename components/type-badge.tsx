import { FaBullhorn, FaFileLines, FaStar } from "react-icons/fa6"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

const style = "p-3 h-8 text-sm flex gap-2 border-none text-blue-dark bg-blue-light"

export const TypeBadge = ({type, iconOnly = false, className}: {
    type: string,
    iconOnly?: boolean,
    className?: string
}) => {

    return (
        <Badge variant="outline" className={cn(style, className)}>
            {type === "ASSET" && (
                <>
                    <FaStar/>
                    {!iconOnly && "Asset"}
                </>
            )}
            {type === "PROJECT" && (
                <>
                    <FaFileLines/>
                    {!iconOnly && "Project"}
                </>
            )}
            {type === "RFP" && (
                <>
                    <FaBullhorn/>
                    {!iconOnly && "RFP"}
                </>
            )}
        </Badge>
    )


    // if (type === "ASSET") {
    //     return (
    //         <Badge variant="outline"
    //                className={cn("p-1 h-8 text-sm flex gap-2 border-none text-asset-foreground bg-asset", className)}>
    //             <FaStar/>
    //             {!iconOnly && "Asset"}
    //         </Badge>
    //     )
    // }

    // if (type === "PROJECT") {
    //     return (
    //         <Badge variant="outline"
    //                className={cn("p-1 h-8 text-sm flex gap-2 border-none text-project-foreground bg-project", className)}>
    //             <FaFileLines/>
    //             {!iconOnly && "Project"}
    //         </Badge>
    //     )
    // }

    // if (type === "RFP") {
    //     return (
    //         <Badge variant="outline" className={cn("p-1 h-8 text-sm flex gap-2 border-none text-rfp-foreground bg-rfp", className)}>
    //             <FaBullhorn/>
    //             {!iconOnly && "RFP"}
    //         </Badge>
    //     )
    // }

    // return
}
