"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Button } from "@comend/components/ui/button"
import { Label } from "@comend/components/ui/label"
import { Separator } from "@comend/components/ui/separator"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { badgeVariants } from "@comend/components/ui/badge"

import { RFP_OPEN_TO_TYPE_OPTIONS, RFP_STATUS_TYPE_OPTIONS } from "@comend/lib/types"
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils"

import { useRFPSearchStore } from "@/state/search/rfpSearchStore"

export function RFPFiltersDialog() {
    const { filters, setFilters } = useRFPSearchStore()
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
                    <DialogTitle>RFP Filters</DialogTitle>

                    <div>
                        <Label>Condition</Label>
                        <MultipleSelector
                            value={filters.conditions ?? []}
                            onChange={(vals) => setFilterKey("conditions", vals)}
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
                        <Label>Gene</Label>
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

                    <div>
                        <Label>Open to</Label>
                        <MultipleSelector
                            value={filters.openTo ?? []}
                            onChange={(vals) => setFilterKey("openTo", vals)}
                            defaultOptions={RFP_OPEN_TO_TYPE_OPTIONS}
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
                        <Label>Status</Label>
                        <MultipleSelector
                            value={filters.status ?? []}
                            onChange={(vals) => setFilterKey("status", vals)}
                            defaultOptions={RFP_STATUS_TYPE_OPTIONS}
                            placeholder="Select status..."
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
                </DialogContent>
            </Dialog>
        </>
    )
}
