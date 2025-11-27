"use client"

import * as React from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@comend/components/ui/navigation-menu"

import {
    UserIcon,
    LayoutDashboardIcon,
    FlaskConicalIcon,
    DnaIcon,
    DatabaseIcon,
    ClipboardListIcon,
    UsersIcon,
    Store,
} from "lucide-react"
import { cn } from "@comend/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"

function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/")
}

const pages = [
    {
        href: "/profile", 
        label: "Profile", 
        icon: <UserIcon size={16}/>
    },
    {
        href: "/marketplace/biosamples",
        label: "Marketplace",
        icon: <Store size={16} />
    },
    {
        href: "/requests", 
        label: "Requests", 
        icon: <ClipboardListIcon size={16}/>,
        comingSoon: true
    },
]

export function ResearcherNavbarMenu() {
    const pathname = usePathname()

    return (
        <NavigationMenu viewport={false} className="w-full">
            <NavigationMenuList>
                {pages.map(({href, label,  icon, comingSoon}) => (
                    <NavigationMenuItem key={href}>
                        <NavigationMenuLink
                            asChild
                            className={navigationMenuTriggerStyle({
                                className: `${isActive(pathname, href) ? "bg-muted text-foreground" : ""}`,
                            })}
                        >
                            {comingSoon ? (
                                <Tooltip key={href} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div
                                            // href={""}
                                            className={cn(
                                                navigationMenuTriggerStyle({
                                                    className: `${isActive(pathname, href) ? "bg-muted text-foreground" : ""}`,
                                                }),
                                                comingSoon ? "opacity-60" : "" // Disable click and add opacity
                                            )}
                                        >
                                            <div className="flex flex-row items-center gap-2">
                                                <div>{icon}</div>
                                                <div className="hidden sm:block">
                                                    {label}
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Coming soon!</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Link 
                                    href={href}
                                    className={cn(
                                        comingSoon ? "pointer-events-none opacity-60" : "" // Disable click and add opacity
                                    )}
                                >
                                    <div className="flex flex-row items-center gap-2">
                                        <div>{icon}</div>
                                        <div className="hidden sm:block">
                                            {label}
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
