import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { FileText, Megaphone, Star } from "lucide-react"

const style = "h-8 text-sm flex justify-center gap-2 border-none text-blue-dark bg-blue-light"

export const TypeBadge = ({type, iconOnly = false, className}: {
    type: string,
    iconOnly?: boolean,
    className?: string
}) => {

    return (
        <Badge variant="outline" className={cn(iconOnly ? "w-8" : "", style, className)}>
            {type === "ASSET" && (
                <>
                    <Star />
                    {!iconOnly && "Asset"}
                </>
            )}
            {type === "PROJECT" && (
                <>
                    <FileText />
                    {!iconOnly && "Project"}
                </>
            )}
            {type === "RFP" && (
                <>
                    <Megaphone />
                    {!iconOnly && "RFP"}
                </>
            )}
        </Badge>
    )


    // if (type === "ASSET") {
    //     return (
    //         <Badge variant="outline"
    //                className={cn("p-1 h-8 text-sm flex gap-2 border-none text-asset-foreground bg-asset", className)}>
    //             <Star />
    //             {!iconOnly && "Asset"}
    //         </Badge>
    //     )
    // }

    // if (type === "PROJECT") {
    //     return (
    //         <Badge variant="outline"
    //                className={cn("p-1 h-8 text-sm flex gap-2 border-none text-project-foreground bg-project", className)}>
    //             <FileText />
    //             {!iconOnly && "Project"}
    //         </Badge>
    //     )
    // }

    // if (type === "RFP") {
    //     return (
    //         <Badge variant="outline" className={cn("p-1 h-8 text-sm flex gap-2 border-none text-rfp-foreground bg-rfp", className)}>
    //             <Megaphone />
    //             {!iconOnly && "RFP"}
    //         </Badge>
    //     )
    // }

    // return
}
