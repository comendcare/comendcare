"use client"

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@comend/components/ui/dialog"
import {Label} from "@comend/components/ui/label"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import {badgeVariants} from "@comend/components/ui/badge"
import {BIOSAMPLE_TYPE_OPTIONS} from "@comend/lib/types"
import {
    handleAsyncConditionSearch,
    handleAsyncGeneSearch,
    handleAsyncOrganizationSearch,
} from "@comend/lib/utils"

import {useBiosampleSearchStore} from "@/state/search/biosampleSearchStore"
import {useOrganizationSearchStore} from "@/state/search/organizationSearchStore"
import {useDiseaseModelSearchStore} from "@/state/search/diseaseModelSearchStore"
import {useClinicalDatasetSearchStore} from "@/state/search/clinicalDatasetSearchStore"
import {Button} from "../../ui/button";
import {Funnel} from "lucide-react";
import {useRef} from "react";


export function BiosampleFiltersDialog() {
    const {filters, setFilters} = useBiosampleSearchStore()
    const { filters: organizationFilters, setFilters: setOrganizationFilters } = useOrganizationSearchStore()
    const { filters: diseaseModelFilters, setFilters: setDiseaseModelFilters } = useDiseaseModelSearchStore()
    const { filters: clinicalDatasetFilters, setFilters: setClinicalDatasetFilters } = useClinicalDatasetSearchStore()
    const dialogRef = useRef<HTMLDivElement>(null)

    const setFilterKey = (key: keyof typeof filters, value: any[]) => {
        setFilters({ ...filters, [key]: value })

        if (key === "conditions" || key === "genes") {
            setOrganizationFilters({ ...organizationFilters, [key]: value })
            setDiseaseModelFilters({ ...diseaseModelFilters, [key]: value })
            setClinicalDatasetFilters({ ...clinicalDatasetFilters, [key]: value })
        }
    }

    return (

        <Dialog>
            <DialogTrigger asChild>
                <Button className="m-4 rounded-full" variant={'cta'}>
                    <Funnel/>
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
                <DialogTitle>Biosample filters</DialogTitle>
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
                        loadingIndicator={<p
                            className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading
                            conditions...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
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
                        loadingIndicator={<p
                            className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading
                            genes...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        triggerSearchOnFocus={true}
                        showHoverCard={false}
                    />
                </div>

                {/* Biosample Types */}
                <div>
                    <Label>Biosample types</Label>
                    <MultipleSelector
                        value={filters.types ?? []}
                        badgeClassName={badgeVariants({variant: "lightBlue"})}
                        onChange={(vals) => setFilterKey("types", vals)}
                        defaultOptions={BIOSAMPLE_TYPE_OPTIONS}
                        placeholder="Select types..."
                        hidePlaceholderWhenSelected
                        commandProps={{className: "bg-transparent"}}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        triggerSearchOnFocus={true}
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
                        loadingIndicator={<p
                            className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading
                            organizations...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        triggerSearchOnFocus={true}
                        showHoverCard={false}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}