"use client"
import React, {useEffect, useState} from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MatchCard } from "~web/components/match-card"
import { toast } from "sonner"
import {getTopPubMedPublications} from "@/lib/fetchers";
import {PubMedPublication} from "~web/types/types";


export default function EditMilestoneDetailsPublicationsTab() {
    const [publications, setPublications] = useState<PubMedPublication[]>()

    useEffect(() => {
        async function fetchPublicationsData() {
            try {
                const response = await getTopPubMedPublications()

                // Map the response to the correct structure if needed
                if (response?.success && response?.data) {
                    setPublications(response?.data);
                } else {
                    console.error(response?.error)
                    toast.error(response?.error)
                }

            } catch (error) {
                console.error("Error fetching organizations:", error);
                toast.error("Couldn't get organizations");
            }
        }

        fetchPublicationsData()
    }, []);

    return (
        <ScrollArea
            className="w-full h-[calc(65vh)]"
            type="always"
        >
            <div>
                {publications?.map((publication: PubMedPublication) => {
                        return (
                            <React.Fragment key={publication.id}>
                                <div className="px-4 py-2" >
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
                                <Separator className="my-2" />
                            </React.Fragment>
                        )
                    }
                )}
            </div>
        </ScrollArea>
    )
}
