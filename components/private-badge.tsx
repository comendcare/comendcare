import { cn } from "@/lib/utils";
import { FaEye } from "react-icons/fa6";

export function PrivateBadge({ className = "" }: { className?: string }) {
    return(
        <p className={cn("inline-flex items-center gap-x-2 text-gray-500 text-sm", className)}>
            <FaEye/>
            Only visible to you
        </p>
    )
}