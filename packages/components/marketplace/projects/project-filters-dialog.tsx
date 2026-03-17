"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Button } from "@comend/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import { Label } from "@comend/components/ui/label"
import MultipleSelector from "@comend/components/ui/multiple-selector"

import { RESEARCH_PLAN_STATUS, RESEARCH_STAGE, RESEARCH_PLAN_TYPES } from "@comend/lib/types"
import { badgeVariants } from "@comend/components/ui/badge"
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

                {/* Stages */}
                {/* <div>
                    <Label>Stages</Label>
                    <MultipleSelector
                        value={filters.stages ?? []}
                        onChange={(vals) => setFilterKey("stages", vals)}
                        defaultOptions={RESEARCH_STAGE}
                        placeholder="Select stage..."
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

                {/* Statuses */}
                {/* <div>
                    <Label>Status</Label>
                    <MultipleSelector
                        value={filters.statuses ?? []}
                        onChange={(vals) => setFilterKey("statuses", vals)}
                        defaultOptions={RESEARCH_PLAN_STATUS}
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
                </div> */}
            </DialogContent>
        </Dialog>
    )
}
