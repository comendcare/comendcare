// MatchCard.tsx
import React from "react"
import { Button } from "@comend/components/ui/button"
import { Bookmark } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card"
import { Badge } from "@comend/components/ui/badge"
import { CircleIcon } from "@radix-ui/react-icons"
import { formatDate } from "@comend/lib/utils"
import { fixPlatformName } from "~web/lib/utils"
import { PubMedPublication } from "~web/types/types"

type MatchCardProps = Partial<PubMedPublication> & {
    onAttach?: (a: { name: string; link: string }) => void
}

export const MatchCard: React.FC<MatchCardProps> = ({
                                                        title,
                                                        authors,
                                                        platform,
                                                        url,
                                                        date,
                                                        keywords,
                                                        onAttach,
                                                    }) => {
    const [attached, setAttached] = React.useState(false)

    const handleAttach = () => {
        if (!url) return
        const ok = onAttach?.({ name: title ?? url, link: url })
        // if the callback returns boolean (as in the helper), you could wire it:
        // if (ok !== false) setAttached(true)
        setAttached(true)
    }

    return (
        <Card className="border-0 bg-card text-card-foreground shadow-none">
            <CardHeader className="items-start gap-4 space-y-0 p-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                        <a href={url ?? ""} className="hover:underline" target="_blank" rel="noopener noreferrer">
                            {title}
                        </a>
                    </CardTitle>
                    <CardDescription>{authors?.join(", ")}</CardDescription>
                </div>

                <Button
                    variant="secondary"
                    className="px-3 shadow-none"
                    onClick={handleAttach}
                    disabled={!url || attached}
                >
                    <Bookmark className="mr-2 h-4 w-4" />
                    {attached ? "Linked" : "Link to this project"}
                </Button>
            </CardHeader>

            <CardContent className="p-2">
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    {platform && (
                        <div className="flex items-baseline">
                            <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
                            {fixPlatformName(platform ?? "")}
                        </div>
                    )}
                    {date && <div>{formatDate(date)}</div>}
                    <div className="flex flex-wrap gap-2">
                        {keywords?.map((keyword, i) => (
                            <Badge key={i} variant="default">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
