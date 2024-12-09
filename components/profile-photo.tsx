import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ProfilePhoto({ img, name, textSize, className }: { img: string | null | undefined, name: string | null | undefined, textSize?: "small" | "large", className?: string | null | undefined }) {
    return (
        <Avatar className={cn(
            className,
            "relative rounded-full ring-4 ring-white"
        )}>
            <AvatarImage
                src={(img ? img : name) || undefined}
                alt={name || ""}
                className="grayscale"
            />
            <AvatarFallback 
                className={
                    cn("h-full w-full", textSize === "large" ? "text-6xl" : "")
                }
            >
                {name?.[0]}
            </AvatarFallback>
        </Avatar>
    )
}