import {TabsContent} from "@/packages/components/ui/tabs";
import {Button} from "@/packages/components/ui/button";
import {Card, CardContent} from "@/packages/components/ui/card";
import {Badge} from "@/packages/components/ui/badge";
import {
    QuoteIcon as Citation,
    ExternalLink,
} from "lucide-react"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@comend/components/ui/pagination"
import {useState} from "react";


export default function ResearcherProfilePublicationsSection({researcherData}: {researcherData: any}) {
    const publications: any[] = Array.isArray(researcherData?.publications) ? researcherData!.publications : [];

    const ITEMS_PER_PAGE = 5
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(publications.length / ITEMS_PER_PAGE)

    const paginatedPublications = publications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <TabsContent value="publications" className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Publications</h2>
                <Button variant="outline" size="sm">
                    View All ({publications.length})
                </Button>
            </div>

            <div className="space-y-4">
                {publications.length > 0 ?
                    paginatedPublications.map((pub: any, index: number) => (
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
                                        <div
                                            className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                            <span
                                                                className="font-medium">{pub.host_venue?.display_name || "Unknown Journal"}</span>
                                            <span>{pub.publication_year}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {pub.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div
                                                className="flex items-center gap-1 text-sm text-gray-600">
                                                <Citation className="w-4 h-4"/>
                                                <span>{pub.cited_by_count ?? 0} citations</span>
                                            </div>
                                            {pub.doi && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={() => window.open(`https://doi.org/${pub.doi}`, "_blank")}
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1"/>
                                                    DOI
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : <div
                        className="w-full h-full flex flex-col space-y-4 justify-center items-center mx-auto text-center text-gray-500 p-8">
                        <div>
                            <p>No publications found.</p>
                            {researcherData?.orcid ?
                                <p>
                                    Try adjusting your filters or search terms.
                                </p>
                                :
                                <p>
                                    Please add your ORCID so we can find your publications.
                                </p>
                            }
                        </div>
                    </div>
                }
            </div>
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={currentPage === i + 1}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setCurrentPage(i + 1)
                                    }}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </TabsContent>
    )
}
