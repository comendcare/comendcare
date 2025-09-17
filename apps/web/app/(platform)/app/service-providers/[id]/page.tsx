import Link from "next/link";
import React from "react";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from "@comend/components/ui/tooltip"
import { ArrowLeft, Store } from "lucide-react";
import CROPageTabs from "~web/components/marketplace/cro-page-tabs";
import CROPageHeader from "~web/components/marketplace/cro-page-header";
import {notFound} from "next/navigation";
import prisma from "@/packages/lib/prisma";
import {CompanyWithReviewsAndServices} from "@/packages/lib/types";

export default async function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)

    const company = await prisma.company.findUnique({
        where: {id},
        select: {
            id: true,
            url: true,
            scientistDotComURL: true,
            title: true,
            description: true,
            yearEstablished: true,
            website: true,
            headquarters: true,
            companyType: true,
            sites: true,
            services: true,
            certifications: true,
            simplifiedCertifications: true,
            rfis: true,
            reviews: {
                include: {
                    author: true,
                    organization: true,
                    feedbacks: true
                }
            },
            tags: true,
            avgRating: true,
            categories: true,
            milestoneTypes: true,
            savedByOrganizations: true,
            createdAt: true,
            updatedAt: true,
            metadata: true
        },
    });

    if (!company) {
        notFound();
    }

    return (
        <TooltipProvider>
            <div
                className="flex flex-col w-full max-w-7xl mx-auto p-8 gap-4"
            >
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/service-providers`
                            : `http://localhost:3000/app/marketplace/service-providers`
                    }
                    className="inline-flex items-center gap-x-2 hover:underline"
                >
                    <ArrowLeft />
                    <Store className="h-4 w-4"/>
                    Return to marketplace
                </Link>
                <main className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
                    <CROPageHeader company={company as CompanyWithReviewsAndServices}/>
                    <CROPageTabs company={company as CompanyWithReviewsAndServices}/>
                </main>
            </div>
        </TooltipProvider>
    )
}
