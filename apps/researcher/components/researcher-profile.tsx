import {Avatar, AvatarFallback, AvatarImage} from "@comend/components/ui/avatar"
import {Badge} from "@comend/components/ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card"
import {
    Building2, Globe,
    Mail,
    MapPin,
    Star,
    TrendingUp,
} from "lucide-react"
import {
    formatNumberWithCommas,
    mapMilestoneValueToLabel,
    mapModalityValueToLabel,
    mapTitleToValue
} from "@comend/lib/utils";
import EditResearcherProfileDialog from "~researcher/components/edit-researcher-profile-dialog";
import ResearcherProfilePublicationsSection from "@comend/components/researcher-profile-publications-section";
import ResearcherProfileFrequentCollaboratorsCard
    from "@comend/components/researcher-profile-frequent-collaborators-card";
import ResearcherProfileEducationCard from "@comend/components/researcher-profile-education-card";
import {EnrichedResearcher} from "~researcher/types/types";
import {COUNTRIES} from "@comend/lib/types";
import {Researcher} from "@prisma/client";

type ResearchMetrics = {
    citations: number;
    hIndex: number;
    publications: number;
    yearsActive: number;
};

const defaultMetrics: ResearchMetrics = {
    citations: 0,
    hIndex: 0,
    publications: 0,
    yearsActive: 0,
};

const resolveCountry = (countryCodeOrName?: string | null) => {
    if (!countryCodeOrName) return null;

    const match = COUNTRIES.find(
        c =>
            c.label.toLowerCase() === countryCodeOrName.toLowerCase() ||
            c.value.toLowerCase() === countryCodeOrName.toLowerCase()
    );

    return match?.label ?? countryCodeOrName;
};

export default function ResearcherProfile({
                                              researcherData,
                                              publications = [],
                                              metrics = defaultMetrics,
                                          }: {
    researcherData: any;        // or EnrichedResearcher
    publications?: any[];
    metrics?: ResearchMetrics;
}) {

    const researchInterests: string[] = Array.from(
        new Set(
            [
                ...(researcherData?.researchInterests?.map(mapMilestoneValueToLabel) ?? []),
                ...(researcherData?.therapeuticsOfInterest?.map(mapModalityValueToLabel) ?? []),
                ...(researcherData?.conditionsOfInterest ?? []),
                ...(researcherData?.genesOfInterest ?? []),
            ].filter(Boolean)
        )
    );

    console.log("shit", researcherData.website)
    console.log("shit", researcherData.website)
    return (
        <div className="max-w-7xl mx-auto flex flex-col py-4">
            <div className="bg-white border-b">
                <div className="px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage
                                src={researcherData?.user?.image}
                                alt={researcherData?.user?.name}
                            />
                            <AvatarFallback className="text-2xl">
                                {researcherData?.user?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {researcherData?.user?.name}
                                    </h1>
                                    {mapTitleToValue(researcherData?.title) && (
                                        <p className="text-xl text-gray-600 mt-1">
                                            {mapTitleToValue(researcherData?.title)}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">

                                        {researcherData?.affiliations[0]?.institution?.name && (
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4"/>
                                                <span>{researcherData?.affiliations[0]?.institution?.name}</span>
                                            </div>
                                        )}

                                        {researcherData?.country && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4"/>
                                                <span>{resolveCountry(researcherData.country)}</span>
                                            </div>
                                        )}

                                        {researcherData?.user?.email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4"/>
                                                <span>{researcherData.user.email}</span>
                                            </div>
                                        )}

                                        {researcherData?.website && (
                                            <div className="flex items-center gap-1">
                                                <Globe className="w-4 h-4"/>
                                                <span>{researcherData.website}</span>
                                            </div>
                                        )}

                                    </div>

                                </div>

                                <div className="flex gap-2">
                                    {researcherData &&
                                        <EditResearcherProfileDialog
                                            researcher={researcherData}
                                        />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Metrics */}
                        {/*<Card>*/}
                        {/*    <CardHeader>*/}
                        {/*        <CardTitle className="flex items-center gap-2">*/}
                        {/*            <TrendingUp className="w-5 h-5"/>*/}
                        {/*            Research Metrics*/}
                        {/*        </CardTitle>*/}
                        {/*    </CardHeader>*/}

                        {/*    <CardContent className="space-y-4">*/}
                        {/*        {!researcherData?.orcid ? (*/}
                        {/*            <div className="text-sm text-gray-600">*/}
                        {/*                Add your ORCID to see your citation metrics.*/}
                        {/*            </div>*/}
                        {/*        ) : (*/}
                        {/*            <div className="grid grid-cols-2 gap-4">*/}
                        {/*                <div className="text-center">*/}
                        {/*                    <div className="text-2xl font-bold text-blue-600">*/}
                        {/*                        {formatNumberWithCommas(metrics.citations)}*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-gray-600">Citations</div>*/}
                        {/*                </div>*/}

                        {/*                <div className="text-center">*/}
                        {/*                    <div className="text-2xl font-bold text-green-600">*/}
                        {/*                        {metrics.hIndex}*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-gray-600">h-index</div>*/}
                        {/*                </div>*/}

                        {/*                <div className="text-center">*/}
                        {/*                    <div className="text-2xl font-bold text-purple-600">*/}
                        {/*                        {metrics.publications}*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-gray-600">Publications</div>*/}
                        {/*                </div>*/}

                        {/*                <div className="text-center">*/}
                        {/*                    <div className="text-2xl font-bold text-orange-600">*/}
                        {/*                        {metrics.yearsActive}*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-gray-600">Years Active</div>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*    </CardContent>*/}
                        {/*</Card>*/}


                        {/* Research Interests */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5"/>
                                    Research Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {researchInterests.length > 0 ?
                                        researchInterests.map((interest: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {interest}
                                            </Badge>
                                        ))
                                        :
                                        <div className="text-sm text-gray-600">
                                            No research interests data available.
                                        </div>
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        {/*<ResearcherProfileEducationCard openAlex={openAlex} />*/}

                        {/* Top Co-authors */}
                        {/*<ResearcherProfileFrequentCollaboratorsCard coAuthors={coAuthors} />*/}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            {researcherData?.description ?
                                <>
                                    <CardHeader>
                                        <CardTitle>
                                            About
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col space-y-4">
                                        <div className="prose max-w-none">
                                            {researcherData?.description ?? ""}
                                        </div>

                                        <ResearcherProfilePublicationsSection
                                            publications={publications}
                                            orcid={researcherData?.orcid}
                                        />
                                    </CardContent>
                                </>
                                :
                                <>
                                    <CardHeader>
                                        <CardTitle>
                                            About
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col space-y-4">
                                        {!researcherData?.orcid ? (
                                            <div className="text-sm text-gray-600">
                                                Add your ORCID to display your publications.
                                            </div>
                                        ) : publications.length > 0 ? (
                                            <ResearcherProfilePublicationsSection
                                                publications={publications}
                                                orcid={researcherData?.orcid}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                No publications available.
                                            </div>
                                        )}
                                    </CardContent>
                                </>
                            }
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
