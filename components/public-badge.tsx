import { cn } from "@/lib/utils";
import { FaEye, FaGlobe, FaUnlock } from "react-icons/fa6";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function PublicBadge({ className = "", iconOnly = false }: { className?: string, iconOnly?: boolean }) {
    if (iconOnly) {
        return (
            <Tooltip>
                <TooltipTrigger className={cn(className, "text-sm")}>
                <FaGlobe />
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    <p className={cn(className, "text-normal")}>
                        {`Visible on your profile and discoverable in the marketplace.`}
                    </p>
                </TooltipContent>
            </Tooltip>
        )
    }

    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <FaGlobe />
            {!iconOnly && `Public`}
        </p>
    )
}