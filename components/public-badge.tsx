import { cn } from "@/lib/utils";
import { FaEye, FaUnlock } from "react-icons/fa6";

export function PublicBadge({ className = "" }: { className?: string }) {
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-gray-500 text-sm")}>
            <FaUnlock />
            Visible to others
        </p>
    )
}