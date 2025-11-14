import {Badge} from "@comend/components/ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card"
import {
    Users,
} from "lucide-react"

export default function ResearcherProfileFrequentCollaboratorsCard({coAuthors}: {coAuthors: any[]}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5"/>
                    Frequent Collaborators
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {coAuthors.length > 0 ?
                    coAuthors.slice(0, 5).map((author: {
                        name: string,
                        affiliation: string,
                        collaborations: string
                    }, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-sm">{author.name}</div>
                                <div className="text-xs text-gray-600">{author.affiliation}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {author.collaborations}
                            </Badge>
                        </div>
                    ))
                    : <div className="text-sm text-gray-600">No collaborator data available.</div>
                }
            </CardContent>
        </Card>
    )
}
