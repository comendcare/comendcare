"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Button } from "@comend/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import { Label } from "@comend/components/ui/label"
import MultipleSelector from "@comend/components/ui/multiple-selector"

import { MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS } from "@comend/lib/types"
import { useProjectSearchStore } from "@/state/search/projectSearchStore"

export function ProjectFiltersDialog() {
    const { filters, setFilters } = useProjectSearchStore()
    const dialogRef = useRef<HTMLDivElement>(null)

    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
        setFilters({ ...filters, [key]: value })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="m-4 rounded-full" variant={'cta'}>
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
                <DialogTitle>Project Filters</DialogTitle>
                {/* Modalities/Therapeutic Strategies */}
                {/* <div>
                    <Label>Research strategy</Label>
                    <MultipleSelector
                        value={filters.modalities ?? []}
                        onChange={(vals) => setFilterKey("modalities", vals)}
                        defaultOptions={RESEARCH_PLAN_TYPES}
                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                        placeholder="Select strategy..."
                        hidePlaceholderWhenSelected
                        commandProps={{ className: "bg-transparent" }}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                no results found.
                            </p>
                        }
                        showHoverCard={false}
                    />
                </div> */}

                {/* Type */}
                <div>
                    <Label>Type</Label>
                    <MultipleSelector
                        value={filters.types ?? []}
                        onChange={(vals) => setFilterKey("types", vals)}
                        defaultOptions={MILESTONE_TYPE_OPTIONS}
                        placeholder="Select type..."
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

                {/* Status */}
                <div>
                    <Label>Status</Label>
                    <MultipleSelector
                        value={filters.status ?? []}
                        onChange={(vals) => setFilterKey("status", vals)}
                        defaultOptions={MILESTONE_STATUS_OPTIONS}
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
    )
}
