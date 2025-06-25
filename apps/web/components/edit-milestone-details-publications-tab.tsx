"use client"
import React, {useEffect, useState} from "react"
import {ScrollArea} from "@comend/components/ui/scroll-area"
import {Separator} from "@comend/components/ui/separator"
import Spinner from "@comend/components/ui/spinner"
import {MatchCard} from "~web/components/match-card"
import {toast} from "sonner"
import {getTopPubMedPublications} from "@comend/lib/fetchers";
import {PubMedPublication} from "~web/types/types";
import { Skeleton } from "@comend/components/ui/skeleton"


export default function EditMilestoneDetailsPublicationsTab() {
    const [publications, setPublications] = useState<PubMedPublication[]>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPublicationsData() {
            try {
                const response = await getTopPubMedPublications()
                if (response?.success && response?.data) {
                    setPublications(response.data)
                } else {
                    toast.error(response?.error ?? "Failed to fetch publications")
                    setPublications([])
                }
            } catch (error) {
                console.error("Error fetching publications:", error)
                toast.error("Couldn't fetch publications")
                setPublications([])
            } finally {
                setLoading(false)
            }
        }

        fetchPublicationsData()
    }, [])

    return (
        <ScrollArea
            className="w-full h-[calc(75vh)]"
            type="always"
        >
            <div>
                {loading && (
                    <div className="flex flex-col gap-4">
                        <Skeleton className="w-full h-[230px]"/>
                        <Skeleton className="w-full h-[230px]"/>
                        <Skeleton className="w-full h-[230px]"/>
                    </div>
                )}

                {!loading && publications?.length === 0 && (
                    <div className="w-full text-center py-12 text-muted-foreground">
                        No relevant publications were found for your milestone.
                    </div>
                )}

                {publications?.map((publication: PubMedPublication) => {
                        return (
                            <React.Fragment key={publication.id}>
                                <div className="px-4 py-2">
                                    <MatchCard
                                        title={publication.title}
                                        authors={publication.authors}
                                        platform={publication.platform}
                                        url={publication.url}
                                        date={publication.date}
                                        keywords={publication.keywords}
                                        annotations={""}
                                        id={""}
                                        description={""}
                                        saved={false}
                                    />
                                </div>
                                <Separator className="my-2"/>
                            </React.Fragment>
                        )
                    }
                )}
            </div>
        </ScrollArea>
    )
}
