import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Globe } from "lucide-react";

export function PublicBadge({ className = "", iconOnly = false }: { className?: string, iconOnly?: boolean }) {
    if (iconOnly) {
        return (
            <Tooltip>
                <TooltipTrigger className={cn(className, "text-sm")}>
                <Globe className="h-4 w-4"/>
                </TooltipTrigger>
                <TooltipContent className="max-w-80 text-wrap text-left">
                    <p className={cn(className, "text-normal")}>
                        {/* {`Visible on your profile and discoverable in the marketplace.`} */}
                        {`Public milestones are visible on your profile and discoverable in the marketplace.`}
                    </p>
                </TooltipContent>
            </Tooltip>
        )
    }

    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <Globe className="h-4 w-4"/>
            {!iconOnly && `Public`}
        </p>
    )
}