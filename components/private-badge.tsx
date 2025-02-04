import { cn } from "@/lib/utils";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";

export function PrivateBadge({ className = "" }: { className?: string }) {
    return(
        <p className={cn(className, "mt-0 inline-flex items-center gap-x-2 text-gray-500 text-sm")}>
            <FaLock />
            Only visible to you
        </p>
    )
}