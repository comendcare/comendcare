"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    {
        name: "Analytics",
        href: "/analytics",
        comingSoon: false
    },
]

export function AdminRFPsNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/admin/rfps/"}
            links={links}
        />
    )
}
