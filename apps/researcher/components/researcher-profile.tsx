"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@comend/components/ui/avatar"
import { Badge } from "@comend/components/ui/badge"
import { Button } from "@comend/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card"
import { Separator } from "@comend/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@comend/components/ui/tabs"
import {
    Building2,
    Calendar,
    QuoteIcon as Citation,
    Download,
    ExternalLink,
    GraduationCap,
    Mail,
    MapPin,
    Star,
    TrendingUp,
    Users,
} from "lucide-react"
import Link from "next/link"
import {formatNumberWithCommas} from "@/packages/lib/utils";

export default function ResearcherProfile({researcherData}: any) {
    const publications = researcherData?.publications ?? [];

    const openAlex = researcherData?.openAlex ?? {};

    const displayName = openAlex.display_name || "Unknown Researcher";
    const email = researcherData?.researcher?.email || "Email not available";
    const institution = openAlex.last_known_institutions?.[0]?.display_name || "Institution not available";
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

    // const publications = [];

    return (
        <div className="max-w-7xl mx-auto flex flex-col py-4">
            <div className="bg-white border-b">
                <div className="px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Dr. Sarah Chen" />
                            <AvatarFallback className="text-2xl">SC</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {displayName}
                                    </h1>
                                    <p className="text-xl text-gray-600 mt-1">Professor of Molecular Biology & Cancer Research</p>

                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4" />
                                            <span>University of California, San Francisco</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>
                                                {location}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            <span>
                                                {email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        CV
                                    </Button>
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
                                    <TrendingUp className="w-5 h-5" />
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
                                    <Star className="w-5 h-5" />
                                    Research Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {researchInterests.map((interest: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="font-semibold">Ph.D. in Molecular Biology</div>
                                    <div className="text-sm text-gray-600">Harvard University, 2012</div>
                                </div>
                                <div>
                                    <div className="font-semibold">M.S. in Biochemistry</div>
                                    <div className="text-sm text-gray-600">MIT, 2008</div>
                                </div>
                                <div>
                                    <div className="font-semibold">B.S. in Biology</div>
                                    <div className="text-sm text-gray-600">UC Berkeley, 2006</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Co-authors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Frequent Collaborators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {coAuthors.slice(0, 5).map((author: {name: string, affiliation: string, collaborations: string}, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">{author.name}</div>
                                            <div className="text-xs text-gray-600">{author.affiliation}</div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {author.collaborations}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="publications" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="publications">Publications</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="projects">Projects</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>

                            <TabsContent value="publications" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Recent Publications</h2>
                                    <Button variant="outline" size="sm">
                                        View All ({publications.length + 42})
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {publications.map((pub: any, index: number) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <a
                                                            href={pub.doi ? `https://doi.org/${pub.doi}` : pub.id || "#"}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-semibold text-blue-700 hover:text-blue-800 cursor-pointer leading-tight"
                                                        >
                                                            {pub.title}
                                                        </a>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {pub.authorships?.map((a: any) => a.author.display_name).join(", ")}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                            <span className="font-medium">{pub.host_venue?.display_name || "Unknown Journal"}</span>
                                                            <span>{pub.publication_year}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {pub.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <Citation className="w-4 h-4" />
                                                                <span>{pub.cited_by_count ?? 0} citations</span>
                                                            </div>
                                                            {pub.doi && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={() => window.open(`https://doi.org/${pub.doi}`, "_blank")}
                                                                >
                                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                                    DOI
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="about" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About</CardTitle>
                                    </CardHeader>
                                    <CardContent className="prose max-w-none">
                                        <p>
                                            Dr. Sarah Chen is a leading researcher in molecular biology and cancer research at the University
                                            of California, San Francisco. Her work focuses on understanding the molecular mechanisms
                                            underlying cancer development and progression, with particular emphasis on stem cell biology and
                                            precision medicine approaches.
                                        </p>
                                        <p>
                                            {`Dr. Chen's laboratory employs cutting-edge techniques including CRISPR gene editing, single-cell
                                            genomics, and advanced computational methods to identify novel therapeutic targets and biomarkers
                                            for cancer treatment. Her research has been published in top-tier journals and has contributed
                                            significantly to the development of personalized cancer therapies.
                                            `}
                                        </p>
                                        <p>
                                            She is actively involved in mentoring the next generation of scientists and has supervised over 20
                                            graduate students and postdoctoral researchers. Dr. Chen serves on editorial boards of several
                                            prestigious journals and is a frequent speaker at international conferences.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Awards & Honors</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <div className="font-semibold">{`NIH Director's New Innovator Award`}</div>
                                                <div className="text-sm text-gray-600">2023</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <div className="font-semibold">American Cancer Society Research Scholar Grant</div>
                                                <div className="text-sm text-gray-600">2021</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <div className="font-semibold">UCSF Excellence in Teaching Award</div>
                                                <div className="text-sm text-gray-600">2020</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="projects" className="space-y-4">
                                <div className="grid gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">CRISPR-Based Cancer Therapeutics</CardTitle>
                                            <Badge className="w-fit">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Developing novel CRISPR-Cas9 approaches for targeted cancer therapy, focusing on precision
                                                editing of oncogenes and tumor suppressor genes.
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Funding: NIH R01</span>
                                                <Separator orientation="vertical" className="h-3" />
                                                <span>2022-2027</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Single-Cell Atlas of Pancreatic Cancer</CardTitle>
                                            <Badge variant="secondary" className="w-fit">
                                                Completed
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Comprehensive single-cell RNA sequencing study to map cellular heterogeneity in pancreatic
                                                adenocarcinoma and identify therapeutic vulnerabilities.
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Funding: NSF</span>
                                                <Separator orientation="vertical" className="h-3" />
                                                <span>2020-2023</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">AI-Driven Drug Discovery Platform</CardTitle>
                                            <Badge className="w-fit">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Machine learning approaches for predicting drug efficacy and resistance patterns in
                                                hematological malignancies.
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Funding: Industry Partnership</span>
                                                <Separator orientation="vertical" className="h-3" />
                                                <span>2023-2025</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div>
                                                <div className="font-medium text-sm">Published new article in Nature Biotechnology</div>
                                                <div className="text-xs text-gray-500">2 days ago</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div>
                                                <div className="font-medium text-sm">Presented at AACR Annual Meeting 2024</div>
                                                <div className="text-xs text-gray-500">1 week ago</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <div>
                                                <div className="font-medium text-sm">{`Received NIH Director's New Innovator Award`}</div>
                                                <div className="text-xs text-gray-500">2 weeks ago</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                            <div>
                                                <div className="font-medium text-sm">Started collaboration with Stanford University</div>
                                                <div className="text-xs text-gray-500">3 weeks ago</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}
