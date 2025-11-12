import {getCROData} from "@comend/lib/fetchers";
import {notFound} from "next/navigation";
// import {Star} from "@comend/components/cro-rating-section";
import {CertificationBadge} from "@comend/components/certification-badge";
import SaveCRODialog from "~web/components/save-cro-dialog";
import {
    BriefcaseBusiness,
    Building,
    Star,
    Building2,
    Calendar,
    ExternalLink,
    Factory,
    MapPin,
    Rocket,
    University,
    Dna,
    HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {ServiceProviderWebsiteButton} from "../service-provider-website-button";
import {companyTypeMap, CompanyWithReviewsAndServices, StatusType} from "@comend/lib/types";
import ContactCroDialog from "~web/components/contact-cro-dialog";
import SaveCROButton from "~web/components/save-cro-button";
import {Avatar, AvatarFallback, AvatarImage} from "@/packages/components/ui/avatar";
import {HoverableAvatar} from "~web/components/hoverable-avatar";
import {type Milestone, Organization} from "@prisma/client";
import {nameToInitials} from "@/packages/lib/utils";
import StatusButton from "~web/components/milestone-status-button";

type WorkedWithItem = {
    organization: Partial<Organization>,
    milestone: Partial<Milestone>
};

function formatDate(d?: Date | null) {
    return d ? new Date(d).toLocaleDateString() : undefined;
}

function orgPublicUrl(org: WorkedWithItem["organization"] | undefined) {
    if (!org) {
        return "#"
    }

    // Adapt to your routing; safe fallback to '#'
    if (org.customDomain) return `https://${org.customDomain}`;
    if (org.subdomain && process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
        return `https://${org.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
    }

    return "#";
}

const companyTypeIcons: Record<string, React.ReactElement | null> = {
    "Mid-Sized Business (10-100M TTM Revenue)": <Factory className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Small Business (1-10M TTM Revenue)": <Building className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Academic Core Facility": <University className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "New Startup (0-1M TTM Revenue)": <Rocket className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (5 or more employees)": <BriefcaseBusiness className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Large Business (>100M TTM Revenue)": <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
    "Consultant (<5 employees)": <BriefcaseBusiness className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>,
};

export default async function CROPageHeader({
                                                company,
                                                savedCompanyIds,
                                                workedWithOrgs
                                            }:
                                            {
                                                company: CompanyWithReviewsAndServices,
                                                savedCompanyIds?: Set<string>
                                                workedWithOrgs?: Array<Partial<WorkedWithItem>>
                                            }
) {

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
        "Eco-Friendly Business",
        "Woman-Owned Business",
    ]);

    const filteredCertifications = company.simplifiedCertifications.filter(certification =>
        allowedCertifications.has(certification)
    );

    return (
        <div className="grid grid-cols-5 gap-8">
            <div className="col-span-4 flex flex-col space-y-4">
                <div className="min-w-0 flex-1 text-wrap text-3xl font-bold text-gray-900">
                    <h1 className="leading-normal">
                        {company.title}
                    </h1>
                </div>
                {/*<Link*/}
                {/*    href={"?tab=reviews"}*/}
                {/*    className="flex items-center mb-2"*/}
                {/*>*/}
                {/*    {[...Array(5)].map((_, index) => (*/}
                {/*        <Star*/}
                {/*            key={index}*/}
                {/*            filled={company.avgRating ? index < Math.round(company.avgRating) : false}*/}
                {/*        />*/}
                {/*    ))}*/}
                {/*    <p className="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">*/}
                {/*        {company.reviews.length > 0 && typeof company.avgRating === "number"*/}
                {/*            ? Number.isInteger(company.avgRating)*/}
                {/*                ? `${company.avgRating} out of 5`*/}
                {/*                : `${company.avgRating.toFixed(2)} out of 5`*/}
                {/*            : "No reviews yet"}*/}
                {/*    </p>*/}
                {/*</Link>*/}

                <div
                    className="flex flex-col sm:flex-row sm:flex-wrap items-baseline sm:space-x-6">
                    {company.headquarters &&
                        <div className="flex items-center text-gray-500">
                            <MapPin
                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"
                            />
                            Headquartered in {company.headquarters}
                        </div>
                    }
                    {company.yearEstablished && (
                        <div className="flex items-center text-gray-500">
                            <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                      aria-hidden="true"
                            />
                            Founded in {company.yearEstablished}
                        </div>
                    )}
                    {company.companyType && (
                        <div className="flex items-center text-gray-500">
                            {companyTypeIcons[company.companyType] ||
                                <Building className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                          aria-hidden="true"/>}
                            {companyTypeMap[company.companyType] || company.companyType}
                        </div>
                    )}
                    {/* <Link
                        href={"?tab=reviews"}
                        className="flex items-center mb-2 hover:cursor-pointer"
                    >
                        <div className="flex items-center text-gray-500">
                            <Star className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                  aria-hidden="true"
                            />
                            <div className="flex items-center text-gray-500">
                                {company.reviews.length > 0 && typeof company.avgRating === "number"
                                    ? Number.isInteger(company.avgRating)
                                        ? `${company.avgRating} out of 5`
                                        : `${company.avgRating.toFixed(2)} out of 5`
                                    : "No reviews yet"}
                            </div>
                        </div>
                    </Link> */}
                </div>

                {company.tags && company.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 w-5/6">
                        {filteredCertifications.map((certification, index) => (
                            <CertificationBadge
                                key={index}
                                certificationName={certification}
                            />
                        ))}
                        <div className="flex flex-wrap gap-2 w-5/6">
                            {company.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground shadow-sm"
                                >
                                    {tag === "Experienced in rare disease" && (
                                        <Dna className="h-3.5 w-3.5 shrink-0"/>
                                    )}
                                    {tag === "PAG friendly" && (
                                        <HeartHandshake className="h-3.5 w-3.5 shrink-0"/>
                                    )}
                                    <span className="truncate">
                                            {tag}
                                        </span>
                                    </span>
                            ))}
                        </div>
                    </div>
                )}

                {workedWithOrgs && workedWithOrgs.length > 0 && (
                    <div className="flex flex-row space-x-4 justify-start items-center">
                        <div className="text-lg">Worked with:</div>
                        <div
                            className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                            {workedWithOrgs?.map(({organization, milestone}) => {
                                const dateRange = [formatDate(milestone?.startDate), formatDate(milestone?.endDate)]
                                    .filter(Boolean)
                                    .join(" – ");
                                return (
                                    <HoverableAvatar
                                        key={organization?.id}
                                        src={organization?.image ?? undefined}
                                        alt={organization?.name ?? "Organization"}
                                        fallback={nameToInitials(organization?.name)}
                                        name={organization?.name ?? undefined}
                                        description={milestone?.title}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex flex-row items-center justify-start space-x-2">
                                                <Avatar
                                                    className="transition hover:grayscale-0"
                                                >
                                                    <AvatarImage
                                                        src={organization?.image ?? undefined}
                                                        alt={organization?.name ?? "Organization"}/>
                                                    <AvatarFallback>
                                                        {nameToInitials(organization?.name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <a
                                                    href={orgPublicUrl(organization)}
                                                    className="font-semibold text-sm underline underline-offset-2"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {organization?.name ?? "Organization"}
                                                </a>
                                            </div>

                                            <div className="text-xs flex flex-col space-y-2">
                                                <div className="font-medium">{milestone?.title}</div>
                                                {dateRange && (
                                                    <div className="text-muted-foreground">{dateRange}</div>
                                                )}
                                                <StatusButton
                                                    status={milestone?.status as StatusType}
                                                    disabled
                                                />
                                                <div className="text-muted-foreground">
                                                    Updated {formatDate(milestone?.updatedAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </HoverableAvatar>
                                );
                            })}
                        </div>
                    </div>
                )}

                {company.description && company.description.trim() && (
                    <div className="w-5/6">
                        {/*<CRODescription text={company.description}/>*/}
                        {company.description}
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-start items-end space-y-2 col-span-1 w-full justify-self-end">
                <ServiceProviderWebsiteButton cro={company}/>
                {/*<SaveCRODialog cro={company} type={"page"} location={"Service Provider Profile"}/>*/}
                {/*<SaveCROButton*/}
                {/*    cro={company}*/}
                {/*    type={"page"}*/}
                {/*    location={"Service Provider Profile"}*/}
                {/*    savedCompanyIds={savedCompanyIds}*/}
                {/*/>*/}
                <ContactCroDialog cro={company}/>
            </div>
        </div>
    )
}
