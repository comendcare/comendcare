"use client"

import Link from "next/link"
import {usePathname} from "next/navigation"
import {cn} from "./../../packages/lib/utils"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./ui/tooltip";
import { LucideIcon } from "lucide-react";

export function TabNav({
    className,
    baseLink,
    links,
    ...props
}: (React.HTMLAttributes<HTMLDivElement> & {baseLink: string, links: {name: string, href: string, comingSoon: boolean, icon?: LucideIcon}[]})) {
    const pathname = usePathname()

    return (
        <TooltipProvider>
            <div className={cn("mx-auto flex items-center flex-wrap justify-center", className)} {...props}>
                {links.map((link, index) => (
                    link.comingSoon ?
                        <Tooltip key={link.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div
                                    className="flex h-7 items-center justify-center rounded-full px-4 text-center text-sm text-muted-foreground transition-colors"
                                >
                                    {link.icon && <link.icon className="mr-2 h-4 w-4"/>}
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
                            href={baseLink + link.href}
                            key={link.href}
                            className={cn(
                                "min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-base transition-colors hover:text-primary",
                                pathname?.endsWith(link.href)
                                    ? "bg-blue-light font-medium text-primary"
                                    : "text-muted-foreground",
                                link.comingSoon ? "pointer-events-none opacity-60" : "" // Disable click and add opacity
                            )}
                        >
                            {link.icon && <link.icon className="mr-2 h-6 w-6"/>}
                            {link.name}
                        </Link>
                ))}
            </div>
        </TooltipProvider>
    )
}
