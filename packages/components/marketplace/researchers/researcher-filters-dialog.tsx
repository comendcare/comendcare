"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Button } from "@comend/components/ui/button"
import { Label } from "@comend/components/ui/label"
import { Separator } from "@comend/components/ui/separator"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { badgeVariants } from "@comend/components/ui/badge"

import { MILESTONE_TYPE_OPTIONS, MODALITIES } from "@comend/lib/types"
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils"

import { useResearcherSearchStore } from "@/state/search/researcherSearchStore"

export function ResearcherFiltersDialog() {
    const { filters, setFilters } = useResearcherSearchStore()
    const dialogRef = useRef<HTMLDivElement>(null)

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
        setFilters({ ...filters, [key]: value })

    return (
        <>
            <Separator orientation="vertical" className="h-8" />

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="m-4 rounded-full" variant={"cta"}>
                        <Funnel />
                        Filters
                    </Button>
                </DialogTrigger>

                <DialogContent
                    ref={dialogRef}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault() // prevent focusing the first input
                        dialogRef.current?.focus() // focus the dialog content instead
                    }}
                >
                    <DialogTitle>Researcher Filters</DialogTitle>

                    <div>
                        <Label>Research interests</Label>
                        <MultipleSelector
                            value={filters.researchInterests ?? []}
                            onChange={(vals) => setFilterKey("researchInterests", vals)}
                            options={MILESTONE_TYPE_OPTIONS}
                            placeholder="Select option..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                            triggerSearchOnFocus={true}
                            showHoverCard={false}
                        />
                    </div>

                    <div>
                        <Label>Therapeutics of interest</Label>
                        <MultipleSelector
                            value={filters.therapeuticsOfInterest ?? []}
                            onChange={(vals) => setFilterKey("therapeuticsOfInterest", vals)}
                            defaultOptions={MODALITIES}
                            placeholder="Select option..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                            showHoverCard={false}
                        />
                    </div>

                    <div>
                        <Label>Conditions of interest</Label>
                        <MultipleSelector
                            value={filters.conditionsOfInterest ?? []}
                            onChange={(vals) => setFilterKey("conditionsOfInterest", vals)}
                            onSearch={handleAsyncConditionSearch}
                            placeholder="Select conditions..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            loadingIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    Loading conditions...
                                </p>
                            }
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                            triggerSearchOnFocus={true}
                            showHoverCard={false}
                        />
                    </div>

                    <div>
                        <Label>Gene of interest</Label>
                        <MultipleSelector
                            value={filters.genes ?? []}
                            badgeClassName={badgeVariants({ variant: "teal" })}
                            onChange={(vals) => setFilterKey("genes", vals)}
                            onSearch={handleAsyncGeneSearch}
                            placeholder="Select genes..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            loadingIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    Loading genes...
                                </p>
                            }
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                            triggerSearchOnFocus={true}
                            showHoverCard={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
