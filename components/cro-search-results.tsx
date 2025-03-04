"use client"

import React, { useState } from "react"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore";
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "./ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "./comend-loading-spinner";
import {CROMarketplaceCard, CRORecommendationCard} from "@/components/marketplace-cro-card";
import {CROMarketplaceListElement} from "@/components/marketplace-cro-list-element";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import { FaQuestion } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const selector = (state: CROSearchState) => ({
    recommendations: state.recommendations,
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

const researchPlanSelector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId
})

export function CROSearchResults() {
    const { 
        recommendations,
        lastFetchedPage, 
        setLastFetchedPage, 
        view, 
        searchResults 
    } = useCROSearchStore(useShallow(selector))
    const {
        roadmapId
    } = useRoadmapStore(useShallow(researchPlanSelector))
    const [recommendationsIsExpanded, setRecommendationsIsExpanded] = useState(false)

    if (!searchResults) return <ComendLoadingSpinner />

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((cro, index) => (
                        <CROMarketplaceListElement cro={cro} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full flex flex-col gap-4">
                <h1 className="text-xl">Recommendations</h1>
                <div className="relative flex flex-col gap-2 items-start">
                    {(roadmapId && (!recommendations || recommendations.length === 0)) && (
                        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
                            <CardContent className="flex gap-4 p-4">
                                <div>
                                    <Image
                                        alt="No recommendations"
                                        src="https://illustrations.popsy.co/gray/team-idea.svg"
                                        width={400}
                                        height={400}
                                        className="dark:hidden"
                                    />
                                    <Image
                                        alt="No recommendations"
                                        src="https://illustrations.popsy.co/gray/team-idea.svg"
                                        width={400}
                                        height={400}
                                        className="hidden dark:block"
                                    />
                                </div>
                                <div className="flex flex-col justify-center gap-4 items-start">
                                    <h2 className="text-xl">{`Sorry, we don't have any recommendations`}</h2>
                                    <p className="text-md">
                                        {`Please add more information to your research plan to generate some recommendations.`}
                                    </p>
                                    <Link href="/app/research-plan">
                                        <Button className="text-md">Edit research plan</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {recommendations && recommendations.length > 0 && (
                        <>
                            <div className={cn("w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3")}>
                                {(recommendationsIsExpanded ? recommendations || [] : (recommendations || []).slice(0, 2)).map((result, index) => (
                                    <CRORecommendationCard cro={result.content} key={index} milestone={result.milestone} />
                                ))}
                            </div>
                            {recommendationsIsExpanded ? (
                                <Button 
                                    variant={"link"} 
                                    onClick={() => setRecommendationsIsExpanded(false)}
                                    className="text-md pl-0"
                                >
                                    Show less...
                                </Button>
                            ): (
                                <Button 
                                    variant={"link"} 
                                    onClick={() => setRecommendationsIsExpanded(true)}
                                    className="text-md pl-0"
                                >
                                    See all recommendations...
                                </Button>
                            )}

                            {!roadmapId && (
                                <div className="absolute inset-0 bg-black/10 backdrop-blur flex items-center justify-center p-4 rounded-md">
                                    <div className="grid w-full max-w-xl p-4 gap-4 rounded-lg bg-white shadow-lg">
                                        <div className="flex flex-col gap-4 justify-center items-center">
                                            <h2 className="text-lg flex gap-2 items-center">
                                                Start a research plan to view recommendations
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <FaInfoCircle className="h-4 w-4"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-80 !text-xs">
                                                        <p>
                                                            {`In order to generate quality recommendations, Comend needs to know a bit about you! Create your research plan to unlock the full marketplace functionality.`}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </h2>
                                            <Link href="/app/research-plan">
                                                <Button className="text-md">Create research plan</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Separator />

                <h1 className="text-xl">Results</h1>
                <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                    {searchResults.map((cro, index) => (
                        <CROMarketplaceCard cro={cro} key={index} />
                    ))}
                </div>
            </div>
        )
    }
    
    const NoResultsView = () => {
        return (
            <div className="h-full w-full flex flex-col mx-auto justify-center items-center align-center">
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/gray/question-mark.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="text-3xl p-10">
                    {`Sorry, we don't have any results for that search`}
                </p>
            </div>
        )
    }

    return searchResults && (searchResults.length > 0) ? (
        <>
            <ResultsView />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    ):(
        <NoResultsView />
    )
}
