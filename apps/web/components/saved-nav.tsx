"use client"
import { TabNav } from "@comend/components/tab-nav";
import { Building2, Users } from "lucide-react";

const links = [
    {
        name: "Service providers",
        href: "/saved/service-providers",
        icon: Building2,
        comingSoon: false
    },
    {
        name: "Patient groups",
        href: "/saved/patient-groups",
        icon: Users,
        comingSoon: false
    },
    // {
    //     name: "Milestones",
    //     href: "/milestones",
    //     comingSoon: false
    // },
]

export function SavedNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/app"}
            links={links}
        />
    )
}
