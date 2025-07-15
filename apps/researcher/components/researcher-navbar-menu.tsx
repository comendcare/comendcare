"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@comend/components/ui/navigation-menu"

function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/")
}

export function ResearcherNavbarMenu() {
    const pathname = usePathname()

    return (
        <NavigationMenu viewport={false} className="w-full">
            <NavigationMenuList>
                {[
                    { href: "/profile", label: "Profile" },
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/data", label: "Biobank" },
                    { href: "/requests", label: "Requests" },
                    { href: "/cohorts", label: "Cohorts" },
                ].map(({ href, label }) => (
                    <NavigationMenuItem key={href}>
                        <NavigationMenuLink
                            asChild
                            className={navigationMenuTriggerStyle({
                                className: isActive(pathname, href) ? "bg-muted text-foreground" : ""
                            })}
                        >
                            <Link href={href}>{label}</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
