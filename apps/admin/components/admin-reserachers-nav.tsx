"use client"
import { TabNav } from "@comend/components/tab-nav";

const links = [
    // {
    //     name: "Analytics",
    //     href: "/analytics",
    //     comingSoon: false
    // },
    {
        name: "Database",
        href: "/database",
        comingSoon: false
    },
]

export function AdminResearchersNav({className}: React.HTMLAttributes<HTMLDivElement>) {

    return (
        <TabNav 
            className={className}
            baseLink={"/admin/researchers/"}
            links={links}
        />
    )
}
