"use client"
import { TabNav } from "@comend/components/tab-nav";
import { Building2, Database, FlaskConical, Megaphone, Rat, SearchIcon, TestTubeDiagonal, Users, Workflow } from "lucide-react";
import React from "react";

const links = [
    {
        name: "Explore",
        href: "/marketplace",
        icon: SearchIcon,
        comingSoon: false
    },
    {
        name: "Research plans",
        href: "/marketplace/research-plans",
        icon: Workflow,
        comingSoon: false
    },
    {
        name: "Patient groups",
        href: "/marketplace/patient-groups",
        icon: Users,
        comingSoon: false
    },
    {
        name: "Patient biosamples",
        href: "/marketplace/biosamples",
        icon: TestTubeDiagonal,
        comingSoon: false
    },
    {
        name: "Disease models",
        href: "/marketplace/disease-models",
        icon: Rat,
        comingSoon: false
    },
    {
        name: "Clinical datasets",
        href: "/marketplace/clinical-datasets",
        icon: Database,
        comingSoon: false
    },
    {
        name: "RFPs",
        href: "/marketplace/rfps",
        icon: Megaphone,
        comingSoon: false
    },
    {
        name: "Service providers",
        href: "/marketplace/service-providers",
        icon: Building2,
        comingSoon: false
    },
    // {
    //     name: "Researchers",
    //     href: "/marketplace/researchers",
    //     icon: FlaskConical,
    //     comingSoon: false
    // },
]

const publicLinks = [
    {
        name: "Explore",
        href: "/marketplace",
        icon: SearchIcon,
        comingSoon: false
    },
    {
        name: "Research plans",
        href: "/marketplace/research-plans",
        icon: Workflow,
        comingSoon: false
    },
    {
        name: "Patient groups",
        href: "/marketplace/patient-groups",
        icon: Users,
        comingSoon: false
    },
    {
        name: "Patient biosamples",
        href: "/marketplace/biosamples",
        icon: TestTubeDiagonal,
        comingSoon: false
    },
    {
        name: "Disease models",
        href: "/marketplace/disease-models",
        icon: Rat,
        comingSoon: false
    },
    {
        name: "Clinical datasets",
        href: "/marketplace/clinical-datasets",
        icon: Database,
        comingSoon: false
    },
    {
        name: "RFPs",
        href: "/marketplace/rfps",
        icon: Megaphone,
        comingSoon: false
    }
    // {
    //     name: "Researchers",
    //     href: "/marketplace/researchers",
    //     icon: FlaskConical,
    //     comingSoon: false
    // },
]

export function MarketplaceNav({className}: React.HTMLAttributes<HTMLDivElement>) {

    return (
        <TabNav 
            className={className}
            baseLink={"/app"}
            links={links}
        />
    )
}

export function PublicMarketplaceNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={""}
            links={publicLinks}
        />
    )
}
