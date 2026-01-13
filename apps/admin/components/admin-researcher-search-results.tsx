"use client"

import React, { useState } from "react"
import {ResearcherSearchState, useResearcherSearchStore} from "@/state/search/researcherSearchStore";
import {useShallow} from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "@comend/components/comend-loading-spinner";
import {Card, CardContent} from "@comend/components/ui/card";
import {ResearcherCard} from "@comend/components/researcher-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@comend/components/ui/dropdown-menu";
import { Button } from "@comend/components/ui/button";
import { Ellipsis, Trash } from "lucide-react";
import { Dialog, DialogPortal } from "@comend/components/ui/dialog";
import { DeleteResearcherDialogContent } from "./delete-researcher-dialog-content";
import { NoResultsTemplate } from "@comend/components/no-results";

const selector = (state: ResearcherSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    searchResults: state.searchResults
})

export const AdminNoResultsView = () => {
    return (
        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
            <CardContent className="flex gap-4 p-4">
                <NoResultsTemplate 
                    imgAlt="No results"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    title="Sorry, we don't have any results for that search"
                    description="Please try another search."
                />
            </CardContent>
        </Card>
    )
}

export function AdminResearcherSearchResults() {
    const {
        lastFetchedPage,
        setLastFetchedPage,
        searchResults
    } = useResearcherSearchStore(useShallow(selector))

    if (!searchResults) return <ComendLoadingSpinner />

    const ResultsView = () => {
        // default to grid view
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <AdminNoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((researcher, index) => (
                            <ResearcherCard 
                                researcher={researcher} 
                                key={index} 
                                contextMenu={(
                                    <AdminResearcherContextMenu researcher={researcher} />
                                )}
                            />
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

const AdminResearcherContextMenu = ({researcher}: {researcher: any}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    return (
        <>
            <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsOpen(true)
                        }}
                        variant="ghost"
                        className="p-2 justify-end h-full"
                    >
                        <Ellipsis/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" sideOffset={4} className="w-40 p-1">

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            // handleDelete()
                            setIsOpen(false)
                            setDeleteIsOpen(true)
                        }}
                    >
                        <Trash/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        <DeleteResearcherDialogContent researcher={researcher} />
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    )
}
