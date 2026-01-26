"use client"

import { useRef } from "react"
import { Funnel } from "lucide-react"

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog"
import { Button } from "@comend/components/ui/button"
import { Label } from "@comend/components/ui/label"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { badgeVariants } from "@comend/components/ui/badge"

import {
    handleAsyncConditionSearch,
    handleAsyncGeneSearch,
    handleAsyncOrganizationSearch,
} from "@comend/lib/utils"
import {useClinicalDatasetSearchStore} from "@/state/search/clinicalDatasetSearchStore";
import {useOrganizationSearchStore} from "@/state/search/organizationSearchStore";
import {useDiseaseModelSearchStore} from "@/state/search/diseaseModelSearchStore";
import {TOOL_TYPE_OPTIONS} from "@comend/lib/types";

export function ClinicalDatasetsFiltersDialog() {
    const { filters, setFilters } = useClinicalDatasetSearchStore()
    const { filters: organizationFilters, setFilters: setOrganizationFilters } = useOrganizationSearchStore()
    const { filters: diseaseModelFilters, setFilters: setDiseaseModelFilters } = useDiseaseModelSearchStore()

    const dialogRef = useRef<HTMLDivElement>(null)

    const setFilterKey = (key: keyof typeof filters, value: any[]) => {
        // update clinical dataset filters
        setFilters({ ...filters, [key]: value })

        // optional: sync universal filters
        if (key === "conditions" || key === "genes") {
            setOrganizationFilters({ ...organizationFilters, [key]: value })
            setDiseaseModelFilters({ ...diseaseModelFilters, [key]: value })
            // note: no need to setClinicalDatasetFilters here — you're already doing it above
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
                <DialogTitle>Clinical dataset filters</DialogTitle>
                {/* Conditions */}
                <div>
                    <Label>Condition</Label>
                    <MultipleSelector
                        value={filters.conditions ?? []}
                        onChange={(vals) => setFilterKey("conditions", vals)}
                        onSearch={handleAsyncConditionSearch}
                        placeholder="Any condition"
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
                        placeholder="Any gene"
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

                {/* Clinical Dataset Types */}
                <div>
                    <Label>Clinical dataset types</Label>
                    <MultipleSelector
                        value={filters.types ?? []}
                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                        onChange={(vals) => setFilterKey("types", vals)}
                        defaultOptions={TOOL_TYPE_OPTIONS}
                        placeholder="Any"
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