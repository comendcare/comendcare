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
} from "lucide-react"

function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/")
}

const pages = [
    {href: "/profile", label: "Profile", icon: <UserIcon size={16}/>},
    {href: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon size={16}/>},
    {
        href: "/toolkit",
        label: "Tools",
        icon: <FlaskConicalIcon size={16}/>,
        subpages: [
            {href: "/toolkit/biosamples", label: "Biosamples", icon: <DnaIcon size={16}/>},
            {href: "/toolkit/datasamples", label: "Data Samples", icon: <DatabaseIcon size={16}/>},
        ],
    },
    {href: "/requests", label: "Requests", icon: <ClipboardListIcon size={16}/>},
    {href: "/cohorts", label: "Cohorts", icon: <UsersIcon size={16}/>},
]

export function ResearcherNavbarMenu() {
    const pathname = usePathname()

    return (
        <NavigationMenu viewport={false} className="w-full">
            <NavigationMenuList>
                {pages.map(({href, label, subpages, icon}) => (
                    <NavigationMenuItem key={href}>
                        {subpages ? (
                            <>
                                <NavigationMenuTrigger
                                    className={`flex items-center gap-2 ${
                                        isActive(pathname, href) ? "bg-muted text-foreground" : ""
                                    }`}
                                >
                                    {icon}
                                    {label}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[200px] gap-2">
                                        {subpages.map(({href: subHref, label: subLabel, icon: subIcon}) => (
                                            <li key={subHref}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={subHref}
                                                        className={`${
                                                            isActive(pathname, subHref)
                                                                ? "text-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex flex-row items-center gap-2 text-sm font-medium`}
                                                        >
                                                            <div>
                                                                {subIcon}
                                                            </div>
                                                            <div>
                                                                {subLabel}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <NavigationMenuLink
                                asChild
                                className={navigationMenuTriggerStyle({
                                    className: `${
                                        isActive(pathname, href) ? "bg-muted text-foreground" : ""
                                    }`,
                                })}
                            >
                                <Link href={href}>
                                    <div className="flex flex-row items-center gap-2">
                                        <div>
                                            {icon}
                                        </div>
                                        <div>
                                            {label}
                                        </div>
                                    </div>
                                </Link>
                            </NavigationMenuLink>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
