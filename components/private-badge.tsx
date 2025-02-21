import { cn } from "@/lib/utils";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function PrivateBadge({ iconOnly = false, className = "" }: { iconOnly?: boolean, className?: string }) {
    if (iconOnly) {
        return (
            <Tooltip>
                <TooltipTrigger className={cn(className, "text-sm")}>
                    <FaLock />
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    <p className={cn(className, "text-normal")}>{`Only visible to your team`}</p>
                </TooltipContent>
            </Tooltip>
        )
    }
    
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <FaLock />
            {!iconOnly && `Only visible to your team`}
        </p>
    )
}