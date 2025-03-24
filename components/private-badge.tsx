import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Lock } from "lucide-react";

export function PrivateBadge({ iconOnly = false, className = "" }: { iconOnly?: boolean, className?: string }) {
    if (iconOnly) {
        return (
            <Tooltip>
                <TooltipTrigger className={cn(className, "text-sm")}>
                    <Lock />
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    <p className={cn(className, "text-normal")}>
                        {/* {`Only visible to your team`} */}
                        {`Private milestones are only visible to your team.`}
                    </p>
                </TooltipContent>
            </Tooltip>
        )
    }
    
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <Lock />
            {!iconOnly && `Only visible to your team`}
        </p>
    )
}