"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    {
        name: "Analytics",
        href: "/analytics",
        comingSoon: false
    },
    {
        name: "Whitelist",
        href: "/whitelist",
        comingSoon: false
    },
    {
        name: "Blacklist",
        href: "/blacklist",
        comingSoon: false
    },
]

export function AdminUsersNav({className}: React.HTMLAttributes<HTMLDivElement>) {

    return (
        <TabNav 
            className={className}
            baseLink={"/admin/users/"}
            links={links}
        />
    )
}
