"use client"
import { Button } from "@/packages/components/ui/button";
import { TabNav } from "@comend/components/tab-nav";
import { ArrowLeft, Building2, Database, Rat, Search, SearchIcon, TestTubeDiagonal, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

const links = [
    {
        name: "Explore",
        href: "/marketplace",
        icon: SearchIcon,
        comingSoon: false
    },
    {
        name: "Service Providers",
        href: "/marketplace/service-providers",
        icon: Building2,
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/marketplace/patient-groups",
        icon: Users,
        comingSoon: false
    },
    {
        name: "Biosamples",
        href: "/marketplace/biosamples",
        icon: TestTubeDiagonal,
        comingSoon: false
    },
    {
        name: "Disease Models",
        href: "/marketplace/disease-models",
        icon: Rat,
        comingSoon: false
    },
    {
        name: "Clinical Datasets",
        href: "/marketplace/clinical-datasets",
        icon: Database,
        comingSoon: false
    },
]

const publicLinks = [
    {
        name: "Explore",
        href: "/marketplace",
        icon: SearchIcon,
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/marketplace/patient-groups",
        icon: Users,
        comingSoon: false
    },
    {
        name: "Biosamples",
        href: "/marketplace/biosamples",
        icon: TestTubeDiagonal,
        comingSoon: false
    },
    {
        name: "Disease Models",
        href: "/marketplace/disease-models",
        icon: Rat,
        comingSoon: false
    },
    {
        name: "Clinical Datasets",
        href: "/marketplace/clinical-datasets",
        icon: Database,
        comingSoon: false
    },
    // {
    //     name: "Milestones",
    //     href: "/milestones",
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
