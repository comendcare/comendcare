"use client"
import { Button } from "@/packages/components/ui/button";
import { TabNav } from "@comend/components/tab-nav";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

const links = [
    {
        name: "Service Providers",
        href: "/service-providers",
        comingSoon: false
    },
    {
        name: "Patient Groups",
        href: "/patient-groups",
        comingSoon: false
    },
    {
        name: "Biosamples",
        href: "/biosamples",
        comingSoon: false
    },
    {
        name: "Disease Models",
        href: "/disease-models",
        comingSoon: false
    },
    {
        name: "Clinical Datasets",
        href: "/clinical-datasets",
        comingSoon: false
    },
    // {
    //     name: "Milestones",
    //     href: "/milestones",
    //     comingSoon: false
    // },
]

const publicLinks = [
    {
        name: "Patient Groups",
        href: "/patient-groups",
        comingSoon: false
    },
    {
        name: "Biosamples",
        href: "/biosamples",
        comingSoon: false
    },
    {
        name: "Disease Models",
        href: "/disease-models",
        comingSoon: false
    },
    {
        name: "Clinical Datasets",
        href: "/clinical-datasets",
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
        // <div className="flex flex-row items-center">
        //     <Button asChild variant={"secondary"} className="absolute left-0">
        //         <Link
        //             href={'/app/marketplace'}
        //         >
        //             <ArrowLeft />
        //             <Search/>
        //             Return to explore
        //         </Link>
        //     </Button>
            <TabNav 
                className={className}
                baseLink={"/app/marketplace/"}
                links={links}
            />
        // </div>
    )
}

export function PublicMarketplaceNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/marketplace/"}
            links={publicLinks}
        />
    )
}
