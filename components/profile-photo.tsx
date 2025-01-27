import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ProfilePhoto({
                                 img,
                                 name,
                                 textSize,
                                 className
                             }: {
    img: string | null | undefined;
    name: string | null | undefined;
    textSize?: "small" | "medium" | "large";
    className?: string | null | undefined;
}) {
    return (
        <Avatar
            className={cn(
                "relative rounded-full ring-4 ring-white",
                className,
            )}
        >
            <AvatarImage
                src={img || undefined}
                alt={name || ""}
            />
            <AvatarFallback
                className={cn(
                    "h-full w-full",
                    textSize === "small" && "text-2xl",
                    textSize === "medium" && "text-4xl",
                    textSize === "large" && "text-6xl"
                )}
            >
                {name?.[0]}
            </AvatarFallback>
        </Avatar>
    );
}
