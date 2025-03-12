"use client"

import React, { useEffect, useState } from "react"
import { CROSearchState, sampleCROs, useCROSearchStore } from "@/state/search/croSearchStore";
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
import Loading from "@/app/loading";
import Spinner from "@/components/ui/spinner"
import logo from "@/public/Full logo.png"
import { useSearchParams } from "next/navigation";

const selector = (state: CROSearchState) => ({
    recommendations: state.recommendations,
    setRecommendations: state.setRecommendations,
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

const researchPlanSelector = (state: RoadmapState) => ({
    initialized: state.initialized,
    roadmapId: state.roadmapId,
    milestones: state.milestones
})

export const NoResultsView = () => {
    return (
        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
            <CardContent className="flex gap-4 p-4">
                <div>
                    <Image
                        alt="No recommendations"
                        src="https://illustrations.popsy.co/white/question-mark.svg"
                        width={300}
                        height={300}
                        className="dark:hidden"
                    />
                    <Image
                        alt="No recommendations"
                        src="https://illustrations.popsy.co/white/question-mark.svg"
                        width={300}
                        height={300}
                        className="hidden dark:block"
                    />
                </div>
                <div className="flex flex-col justify-center gap-4 items-start">
                    <h2 className="text-xl">{`Sorry, we don't have any results for that search`}</h2>
                    <p className="text-md">
                        {`Please try another search.`}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export function CROSearchResults() {
    const { 
        recommendations,
        setRecommendations,
        lastFetchedPage, 
        setLastFetchedPage, 
        view, 
        searchResults 
    } = useCROSearchStore(useShallow(selector))
    const {
        initialized: roadmapInitialized,
        roadmapId,
        milestones
    } = useRoadmapStore(useShallow(researchPlanSelector))
    const searchParams = useSearchParams()
    const [recommendationsIsExpanded, setRecommendationsIsExpanded] = useState(searchParams.get("expanded") === "true")

    useEffect(() => {
        if (milestones && roadmapInitialized) {
            const urlMilestone = searchParams.get("milestone")
            const options = urlMilestone ? { priority: urlMilestone } : undefined
            if (options) setRecommendations(milestones, options)
        }
    }, [milestones])

    if (!searchResults) return <ComendLoadingSpinner />
    console.log(searchResults)

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
                <div className="relative flex flex-col gap-2 items-start">
                    {(!roadmapId && roadmapInitialized) ? (
                        <>
                        <div className={cn("w-full min-h-[200px] grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3")}>
                            {sampleCROs.map((result, index) => (
                                <CRORecommendationCard cro={result.content} key={index} milestone={result.milestone} />
                            ))}
                        </div>

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
                                            <Button variant={"cta"} className="text-md">Create research plan</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    ): (
                        <>
                        {!recommendations && (
                            <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
                                <CardContent className="flex flex-col space-y-8 py-20 items-center justify-center">
                                    <Spinner className="scale-150" />
                                    <div className="w-1/6 min-w-40">
                                        <Image priority src={logo} alt="Comend logo" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {(recommendations && recommendations.length === 0) && (
                            <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
                                <CardContent className="flex gap-4 p-4">
                                    <div>
                                        <Image
                                            alt="No recommendations"
                                            src="https://illustrations.popsy.co/white/team-idea.svg"
                                            width={400}
                                            height={400}
                                            className="dark:hidden"
                                        />
                                        <Image
                                            alt="No recommendations"
                                            src="https://illustrations.popsy.co/white/team-idea.svg"
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
                                            <Button variant={"cta"} className="text-md">Edit research plan</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {recommendations && recommendations.length > 0 && (
                            <>
                                <div className={cn("w-full min-h-[200px] grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3")}>
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
                            </>
                        )}
                        </>
                    )}
                </div>

                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((cro, index) => (
                            <CROMarketplaceCard cro={cro} key={index} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    )
}
