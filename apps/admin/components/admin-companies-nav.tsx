"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"

import {cn} from "@/lib/utils"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

const links = [
    {
        name: "Analytics",
        href: "/analytics",
        comingSoon: false
    },
    {
        name: "Database",
        href: "/database",
        comingSoon: false
    },
]

export function AdminCompaniesNav({
                                   className,
                                   ...props
                               }: React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname()

    return (
        <TooltipProvider>
            <div className={cn("mx-auto flex items-center", className)} {...props}>
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
                            href={"/admin/companies/" + link.href}
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
