import {notFound} from "next/navigation"
import {getCROData} from "@/lib/fetchers"
import Link from "next/link";
import {companyTypeMap} from "@/components/marketplace-cro-card";
import React from "react";
import {buttonVariants} from "@/components/ui/button";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import CROMarketplaceProfileServicesTab from "@/components/cro-marketplace-profile-services-tab";
import CROMarketplaceProfileSitesTab from "@/components/cro-marketplace-profile-sites-tab";
import CROMarketplaceProfileRFIsTab from "@/components/cro-marketplace-profile-rfis-tab";
import CROMarketplaceProfileCertificationsTab from "@/components/cro-marketplace-profile-certifications-tab";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {CRODescription} from "@/components/cro-description";
import {CertificationBadge} from "@/components/certification-badge";
import CROMarketplaceProfileReviewsTab from "@/components/cro-marketplace-profile-reviews-tab";
import {cn} from "@/lib/utils";
import SaveCRODialog from "@/components/save-cro-dialog";
import {CompanyWithReviewsAndServices} from "@/lib/types";
import { ArrowLeft, Briefcase, BriefcaseBusiness, Building, Building2, Calendar, ExternalLink, Factory, MapPin, Map, Rocket, University, Users, Store } from "lucide-react";
import {Star} from "@/components/cro-rating-section";
import CROPageTabs from "@/components/cro-page-tabs";

const companyTypeIcons: Record<string, JSX.Element> = {
    "Mid-Sized Business (10-100M TTM Revenue)": <Factory className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Small Business (1-10M TTM Revenue)": <Building className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Academic Core Facility": <University className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "New Startup (0-1M TTM Revenue)": <Rocket className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (5 or more employees)": <BriefcaseBusiness className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Large Business (>100M TTM Revenue)": <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (<5 employees)": <BriefcaseBusiness className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
};

export default async function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const cro = await getCROData(id)

    if (!cro) {
        notFound()
    }

    const allowedCertifications = new Set([
        "Good Clinical Practice (GCP)",
        "Good Laboratory Practice (GLP)",
        "Good Manufacturing Practice (GMP)",
        "Clinical Laboratory Improvement Amendments (CLIA)",
        "Good Clinical Laboratory Practice (GCLP)",
        "College of American Pathologists (CAP)",
        "American Society for Clinical Pathology (ASCP)",
        "Diplomate of the American Board of Toxicology (DABT)",
        "Assessment and Accreditation of Laboratory Animal Care (AAALAC)",
        "Institutional animal care and use committee (IACUC)",
        "Office of Laboratory Animal Welfare (OLAW)",
        "United States Department of Agriculture (USDA)",
    ]);

    const filteredCertifications = cro.certifications.filter(certification =>
        allowedCertifications.has(certification.name)
    );

    return (
        <TooltipProvider>
            <div
                className="flex flex-col w-full max-w-7xl mx-auto p-8 gap-4"
            >
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/cro`
                            : `http://localhost:3000/app/marketplace/cro`
                    }
                    className="inline-flex items-center gap-x-2 hover:underline"
                >
                    <ArrowLeft />
                    <Store className="h-4 w-4"/>
                    Return to marketplace
                </Link>
                <main className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-5 gap-8">
                        <div className="col-span-4 flex flex-col space-y-4">
                            <div className="min-w-0 flex-1 text-wrap text-3xl font-bold text-gray-900">
                                <h1 className="leading-normal">
                                    {cro.title}
                                </h1>
                            </div>
                            <Link
                                href={"?tab=reviews"}
                                className="flex items-center mb-2"
                            >
                                {[...Array(5)].map((_, index) => (
                                    <Star
                                        key={index}
                                        filled={cro.avgRating ? index < Math.round(cro.avgRating) : false}
                                    />
                                ))}
                                <p className="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {cro.reviews.length > 0 && typeof cro.avgRating === "number"
                                        ? Number.isInteger(cro.avgRating)
                                            ? `${cro.avgRating} out of 5`
                                            : `${cro.avgRating.toFixed(2)} out of 5`
                                        : "No reviews yet"}
                                </p>
                            </Link>
                            <div
                                className="flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                                {cro.headquarters &&
                                    <div className="flex items-center text-gray-500">
                                        <MapPin
                                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"
                                        />
                                        Headquartered in {cro.headquarters}
                                    </div>
                                }
                                {cro.yearEstablished && (
                                    <div className="flex items-center text-gray-500"> <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                    aria-hidden="true"/>
                                        Founded in {cro.yearEstablished}
                                    </div>
                                )}
                                {cro.companyType && (
                                    <div className="flex items-center text-gray-500">
                                        {companyTypeIcons[cro.companyType] ||
                                            <Building className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                        aria-hidden="true"/>}
                                        {companyTypeMap[cro.companyType] || cro.companyType}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 w-5/6">
                                {filteredCertifications.map((certification, index) => (
                                    <CertificationBadge
                                        key={index}
                                        certificationName={certification.name}
                                    />
                                ))}
                            </div>
                            {cro.description && cro.description.trim() && (
                                <div className="w-5/6">
                                    {/*<CRODescription text={cro.description}/>*/}
                                    {cro.description}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-start items-end space-y-2 col-span-1 w-full justify-self-end">
                            <Link
                                href={cro.url || ""}
                                className={cn(buttonVariants({variant: "secondary"}), "w-fit")}
                                target="_blank"
                            >
                                <ExternalLink className="h-4 w-4"/>
                                Visit website
                            </Link>
                            <SaveCRODialog cro={cro} type={"page"}/>
                        </div>
                    </div>

                    <CROPageTabs cro={cro as CompanyWithReviewsAndServices}/>
                </main>
            </div>
        </TooltipProvider>
    )
}
