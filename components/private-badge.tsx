import { cn } from "@/lib/utils";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";

export function PrivateBadge({ iconOnly = false, className = "" }: { iconOnly?: boolean, className?: string }) {
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <FaLock />
            {!iconOnly && `Only visible to your team`}
        </p>
    )
}