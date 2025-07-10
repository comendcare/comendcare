"use client"
import {TabNav} from "@comend/components/tab-nav"

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
    {
        name: "Contact requests",
        href: "/contact-requests",
        comingSoon: false
    },
]

export function AdminCompaniesNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/admin/companies/"}
            links={links}
        />
    )
}
