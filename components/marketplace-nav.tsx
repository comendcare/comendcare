"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"

import {cn} from "@/lib/utils"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";

const links = [
    {
        name: "Service Providers",
        href: "/service-providers",
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/patient-groups",
        comingSoon: false
    },
    // {
    //     name: "Milestones",
    //     href: "/milestones",
    //     comingSoon: false
    // },
]

interface MarketplaceNavProps extends React.HTMLAttributes<HTMLDivElement> {
    projectId: string
}

export function MarketplaceNav({
                               className,
                               projectId,
                               ...props
                           }: MarketplaceNavProps) {
    const pathname = usePathname()

    return (
        <TooltipProvider>
            <div className={cn("mx-auto my-4 flex items-center", className)} {...props}>
                {links.map((link, index) => (
                    link.comingSoon ?
                        <Tooltip key={link.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div
                                    className="flex h-7 items-center justify-center rounded-full px-4 text-center text-sm text-muted-foreground transition-colors"
                                >
                                    {link.name}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Coming soon!
                                </p>
                            </TooltipContent>
                        </Tooltip>
                        :
                        <Link
                            href={"/app/marketplace/" + link.href}
                            key={link.href}
                            className={cn(
                                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                                pathname?.endsWith(link.href) ||
                                (index === 0 && pathname === "/")
                                    ? "bg-blue-light font-medium text-primary"
                                    : "text-muted-foreground",
                                link.comingSoon ? "pointer-events-none opacity-60" : "" // Disable click and add opacity
                            )}
                        >
                            {link.name}
                        </Link>
                ))}
            </div>
        </TooltipProvider>
    )
}
