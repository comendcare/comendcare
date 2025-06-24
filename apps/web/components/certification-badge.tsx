import { CircleCheck, Flower, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function CertificationBadge({ certificationName }: { certificationName: string }) {
    let badgeClass = "bg-blue-100 text-blue-900";
    let Icon = CircleCheck;

    if (certificationName === "Woman-Owned Business") {
        badgeClass = "bg-pink-100 text-pink-900";
        Icon = Flower;
    } else if (certificationName === "Eco-Friendly Business") {
        badgeClass = "bg-emerald-100 text-emerald-900";
        Icon = Sprout;
    }

    return (
        <div
            className={cn(
                "inline-flex gap-1 items-center font-semibold text-md min-h-7 rounded-md px-2 py-1",
                badgeClass
            )}
        >
            <Icon className="h-4 w-4" />
            <p className="whitespace-nowrap text-sm">
                {certificationName}
            </p>
        </div>
    );
}
