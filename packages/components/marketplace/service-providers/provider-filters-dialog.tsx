"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Button } from "@comend/components/ui/button"
import { Label } from "@comend/components/ui/label"
import { Separator } from "@comend/components/ui/separator"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { badgeVariants } from "@comend/components/ui/badge"

import { useCROSearchStore } from "@/state/search/croSearchStore"
import { BUSINESS_TYPES, CRO_CERTIFICATIONS, MILESTONE_TYPE_OPTIONS } from "@comend/lib/types"

export function ProviderFiltersDialog() {
    const { filters, setFilters } = useCROSearchStore()
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
                    <DialogTitle>Service provider filters</DialogTitle>

                    {/* Project Types */}
                    <div>
                        <Label>Project types</Label>
                        <MultipleSelector
                            value={filters.milestoneTypes}
                            badgeClassName={badgeVariants({ variant: "lightBlue" })}
                            onChange={(vals) => setFilterKey("milestoneTypes", vals)}
                            defaultOptions={MILESTONE_TYPE_OPTIONS}
                            placeholder="Select project types..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                        />
                    </div>

                    {/* Business Types */}
                    <div>
                        <Label>Business types</Label>
                        <MultipleSelector
                            value={filters.types}
                            onChange={(vals) => setFilterKey("types", vals)}
                            defaultOptions={BUSINESS_TYPES}
                            placeholder="Select business types..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                        />
                    </div>

                    {/* Certifications */}
                    <div>
                        <Label>Certifications</Label>
                        <MultipleSelector
                            value={filters.certifications}
                            onChange={(vals) => setFilterKey("certifications", vals)}
                            defaultOptions={CRO_CERTIFICATIONS}
                            placeholder="Select certifications..."
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
