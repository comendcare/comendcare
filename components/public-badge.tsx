import { cn } from "@/lib/utils";
import { FaEye, FaGlobe, FaUnlock } from "react-icons/fa6";

export function PublicBadge({ className = "", iconOnly = false }: { className?: string, iconOnly?: boolean }) {
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-sm")}>
            <FaGlobe />
            {!iconOnly && `Published`}
        </p>
    )
}