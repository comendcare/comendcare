"use client"
import { TabNav } from "@/packages/components/tab-nav";

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

export function AdminOrganizationsNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/admin/organizations/"}
            links={links}
        />
    )
}
