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
import type {CompanyWithReviewsAndServices} from "@/packages/lib/types";
import {getSavedCompaniesFromOrganizationId} from "@/packages/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import NoOrganization from "~web/components/no-organization";
import type {SavedCompany, Organization, Milestone} from "@prisma/client";

type WorkedWithItem = {
    organization: Partial<Organization>,
    milestone: Partial<Milestone>
};

export default async function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const session = await getSession()
    const id = decodeURIComponent(params.id)

    if (!session?.user?.organizationId) return <NoOrganization />

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
            metadata: true,
            biosamples: true,
            diseaseModel: true,
            tool: true,
        },
    });

    const res = await getSavedCompaniesFromOrganizationId(session?.user.organizationId, {
        companyId: true,
    });

    let savedCompanyIds: Set<string> = new Set()
    if (res.success && res.data) {
        savedCompanyIds = new Set(res.data.map((c: SavedCompany) => c.companyId))
    }

    if (!company) {
        notFound();
    }

    const links = await prisma.milestoneToCompany.findMany({
        where: { companyId: id },
        include: {
            milestone: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    updatedAt: true,
                    // If you want the typed tags shown too:
                    types: {
                        select: { milestoneType: { select: { id: true, label: true } } },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            image: true,
                            subdomain: true,
                            customDomain: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ createdAt: "desc" }], // or milestone: { updatedAt: "desc" }
        take: 25,
    });

    const seen = new Set<string>();
    const workedWithItems: WorkedWithItem[] = [];
    for (const l of links) {
        const org = l.milestone.organization;
        if (!org || seen.has(org.id)) continue;
        seen.add(org.id);
        workedWithItems.push({
            organization: org,
            milestone: {
                id: l.milestone.id,
                title: l.milestone.title,
                status: l.milestone.status ?? null,
                startDate: l.milestone.startDate ?? null,
                endDate: l.milestone.endDate ?? null,
                updatedAt: l.milestone.updatedAt,
            },
        });
        if (workedWithItems.length === 5) break;
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
                    <CROPageHeader
                        company={company as CompanyWithReviewsAndServices}
                        savedCompanyIds={savedCompanyIds}
                        workedWithOrgs={workedWithItems}
                    />
                    <CROPageTabs company={company as CompanyWithReviewsAndServices}/>
                </main>
            </div>
        </TooltipProvider>
    )
}
