"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import { Button } from "@comend/components/ui/button"
import { Label } from "@comend/components/ui/label"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { badgeVariants } from "@comend/components/ui/badge"

import { DISEASE_MODEL_TYPE_OPTIONS } from "@comend/lib/types"
import {
    handleAsyncConditionSearch,
    handleAsyncGeneSearch,
    handleAsyncOrganizationSearch,
} from "@comend/lib/utils"

import { useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"

export function DiseaseModelFiltersDialog() {
    // disease models = primary store for this dialog
    const {filters, setFilters} = useDiseaseModelSearchStore()

    // other marketplaces (only needed for syncing universal keys)
    const {filters: organizationFilters, setFilters: setOrganizationFilters} = useOrganizationSearchStore()
    const {filters: biosampleFilters, setFilters: setBiosampleFilters} = useBiosampleSearchStore()
    const {filters: clinicalDatasetFilters, setFilters: setClinicalDatasetFilters} = useClinicalDatasetSearchStore()

    const dialogRef = useRef<HTMLDivElement>(null)

    const setFilterKey = (key: keyof typeof filters, value: any[]) => {
        // update disease model filters
        setFilters({...filters, [key]: value})

        // optional: sync universal filters across marketplaces
        if (key === "conditions" || key === "genes") {
            setOrganizationFilters({...organizationFilters, [key]: value})
            setBiosampleFilters({...biosampleFilters, [key]: value})
            setClinicalDatasetFilters({...clinicalDatasetFilters, [key]: value})
        }
    }

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
                <DialogTitle>Disease model filters</DialogTitle>
                {/* Conditions */}
                <div>
                    <Label>Condition</Label>
                    <MultipleSelector
                        value={filters.conditions ?? []}
                        onChange={(vals) => setFilterKey("conditions", vals)}
                        onSearch={handleAsyncConditionSearch}
                        placeholder="Select conditions..."
                        hidePlaceholderWhenSelected
                        commandProps={{className: "bg-transparent"}}
                        loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading conditions...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        triggerSearchOnFocus={true}
                        showHoverCard={false}
                    />
                </div>

                {/* Genes */}
                <div>
                    <Label>Gene</Label>
                    <MultipleSelector
                        value={filters.genes ?? []}
                        badgeClassName={badgeVariants({variant: "teal"})}
                        onChange={(vals) => setFilterKey("genes", vals)}
                        onSearch={handleAsyncGeneSearch}
                        placeholder="Select genes..."
                        hidePlaceholderWhenSelected
                        commandProps={{className: "bg-transparent"}}
                        loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading genes...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        triggerSearchOnFocus={true}
                        showHoverCard={false}
                    />
                </div>

                {/* Disease Model Types */}
                <div>
                    <Label>Disease model types</Label>
                    <MultipleSelector
                        value={filters.types ?? []}
                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                        onChange={(vals) => setFilterKey("types", vals)}
                        defaultOptions={DISEASE_MODEL_TYPE_OPTIONS}
                        placeholder="Select types..."
                        hidePlaceholderWhenSelected
                        commandProps={{className: "bg-transparent"}}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        showHoverCard={false}
                    />
                </div>

                {/* Patient Group */}
                <div>
                    <Label>Organization</Label>
                    <MultipleSelector
                        value={filters.organizations ?? []}
                        onChange={(vals) => setFilterKey("organizations", vals)}
                        onSearch={handleAsyncOrganizationSearch}
                        placeholder="Select organizations..."
                        hidePlaceholderWhenSelected
                        commandProps={{className: "bg-transparent"}}
                        loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading organizations...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        triggerSearchOnFocus={true}
                        showHoverCard={false}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}