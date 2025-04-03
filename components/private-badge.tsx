import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Lock } from "lucide-react";

export function PrivateBadge({ iconOnly = false, className = "" }: { iconOnly?: boolean, className?: string }) {
    if (iconOnly) {
        return (
            <Tooltip>
                <TooltipTrigger className={cn(className, "text-sm")}>
                    <Lock className="h-4 w-4"/>
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    <p className={cn(className, "text-normal")}>
                        {`Only visible to your team`}
                    </p>
                </TooltipContent>
            </Tooltip>
        )
    }
    
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <Lock className="h-4 w-4"/>
            {!iconOnly && `Only visible to your team`}
        </p>
    )
}