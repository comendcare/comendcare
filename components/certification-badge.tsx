import { CircleCheck, Info } from "lucide-react";
import { Badge } from "./ui/badge";

export function CertificationBadge({certificationName}: {certificationName: string}) {
    return (
        <Badge
            className="w-fit inline-flex items-center gap-2 justify-center bg-emerald-100 px-2.5 py-0.5 text-emerald-700"
        >
            <CircleCheck className="h-4 w-4" />
            <p className="whitespace-nowrap text-sm">
                {certificationName}
            </p>
        </Badge>
    )
}
