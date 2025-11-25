import {Avatar, AvatarFallback, AvatarImage} from "@comend/components/ui/avatar"
import {Badge} from "@comend/components/ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card"
import {
    Building2,
    Mail,
    MapPin,
    Star,
    TrendingUp,
} from "lucide-react"
import {formatNumberWithCommas} from "@comend/lib/utils";
import ResearcherProfilePublicationsSection from "@comend/components/researcher-profile-publications-section";

export default function PublicResearcherProfile({researcherData}: {researcherData: any})
{
    const openAlex = researcherData?.openAlex ?? {};
    const researcher = researcherData?.researcher ?? null;
    const mergedFields = researcherData?.mergedFields ?? {
        name: "Unknown Researcher",
        title: null,
        email: null,
        researchInterests: [] as string[]
    };

    const institution =
        researcher?.affiliations?.[0]?.institution?.name ??
        openAlex?.last_known_institutions?.[0]?.display_name ??
        "Institution not available";

    const displayName = openAlex.display_name || "Unknown Researcher";
    const email = researcherData?.researcher?.email || "Email not available";
    const location = openAlex.last_known_institutions?.[0]?.country_code || "Country not available";

    const metrics = {
        citations: openAlex.cited_by_count ?? 0,
        hIndex: openAlex.summary_stats?.h_index ?? 0,
        publications: openAlex.works_count ?? 0,
        yearsActive: openAlex.counts_by_year ? openAlex.counts_by_year.length : 0
    };

    const researchInterests = openAlex?.topics?.map((topic: any) => topic.display_name) || [];

    const coAuthors = (openAlex?.display_name_alternatives || []).slice(0, 5).map((name: string, index: number) => ({
        name,
        affiliation: institution,
        collaborations: Math.floor(Math.random() * 10) + 1
    }));

    return (
        <div className="max-w-7xl mx-auto flex flex-col py-4">
            <div className="bg-white border-b">
                <div className="px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Dr. Sarah Chen"/>
                            <AvatarFallback className="text-2xl">SC</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {displayName}
                                    </h1>
                                    <p className="capitalize text-xl text-gray-600 mt-1">
                                        {mergedFields.title || "Title not available"}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4"/>
                                            <span>
                                                {institution}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4"/>
                                            <span>
                                                {location}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4"/>
                                            <span>
                                                {email}
                                            </span>
                                        </div>
                                    </div>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5"/>
                                    Research Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatNumberWithCommas(metrics.citations)}
                                        </div>
                                        <div className="text-sm text-gray-600">Citations</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {metrics.hIndex}
                                        </div>
                                        <div className="text-sm text-gray-600">h-index</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {metrics.publications}
                                        </div>
                                        <div className="text-sm text-gray-600">Publications</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {metrics.yearsActive}
                                        </div>
                                        <div className="text-sm text-gray-600">Years Active</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                        <div className="text-sm text-gray-600">No research interests data
                                            available.</div>
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
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col space-y-4">
                                <div className="prose max-w-none">
                                    {mergedFields.title ?? ""}
                                </div>

                                <ResearcherProfilePublicationsSection
                                    researcherData={researcherData}
                                />
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    )
}
