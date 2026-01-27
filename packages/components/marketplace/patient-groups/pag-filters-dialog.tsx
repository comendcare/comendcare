"use client";

import { useRef } from "react";
import { Funnel } from "lucide-react";

import { Button } from "@comend/components/ui/button";
import { Label } from "@comend/components/ui/label";
import { badgeVariants } from "@comend/components/ui/badge";
import { Separator } from "@comend/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import MultipleSelector from "@comend/components/ui/multiple-selector";

import {mechanisms, ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS} from "@comend/lib/types";
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils";

import { useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";

const MECHANISM_OPTIONS = mechanisms.map((m: any) => ({
    label: m.label ?? m.name ?? String(m.id),
    value: String(m.id),
}));

export function PAGFiltersDialog() {
    const { filters, setFilters } = useOrganizationSearchStore();
    const { filters: biosampleFilters, setFilters: setBiosampleFilters } = useBiosampleSearchStore();
    const { filters: diseaseModelFilters, setFilters: setDiseaseModelFilters } = useDiseaseModelSearchStore();
    const { filters: clinicalDatasetFilters, setFilters: setClinicalDatasetFilters } = useClinicalDatasetSearchStore();

    const dialogRef = useRef<HTMLDivElement>(null);

    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) => {
        setFilters({ ...filters, [key]: value });

        // Handle setting universal filters in other marketplaces (if relevant)
        if (key === "conditions" || key === "genes") {
            setBiosampleFilters({ ...biosampleFilters, [key]: value });
            setDiseaseModelFilters({ ...diseaseModelFilters, [key]: value });
            setClinicalDatasetFilters({ ...clinicalDatasetFilters, [key]: value });
        }
    };

    // map to find labels for badges
    const SYSTEM_OPTIONS = ASSOCIATED_SYSTEMS;
    const MODALITY_OPTIONS = MODALITIES;

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
                        e.preventDefault(); // prevent focusing the first input
                        dialogRef.current?.focus(); // focus the dialog content instead
                    }}
                >
                    <DialogTitle>Patient group filters</DialogTitle>

                    <div>
                        <Label>Condition</Label>
                        <MultipleSelector
                            value={filters.conditions ?? []}
                            onChange={(vals) => setFilterKey("conditions", vals)}
                            onSearch={handleAsyncConditionSearch}
                            placeholder="Any condition"
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
                            placeholder="Any gene"
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
                        <Label>Mechanisms of action</Label>
                        <MultipleSelector
                            value={filters.mechanisms ?? []}
                            onChange={(vals) => setFilterKey("mechanisms", vals)}
                            defaultOptions={MOLECULAR_MECHANISMS}
                            placeholder="Any"
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
                        <Label>Associated systems</Label>
                        <MultipleSelector
                            value={filters.systems ?? []}
                            onChange={(vals) => setFilterKey("systems", vals)}
                            defaultOptions={SYSTEM_OPTIONS}
                            placeholder="Any"
                            hidePlaceholderWhenSelected
                            commandProps={{ className: "bg-transparent" }}
                            emptyIndicator={
                                <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                    no results found.
                                </p>
                            }
                        />
                    </div>

                    <div>
                        <Label>Modalities of interest</Label>
                        <MultipleSelector
                            value={filters.modalities ?? []}
                            onChange={(vals) => setFilterKey("modalities", vals)}
                            defaultOptions={MODALITY_OPTIONS}
                            placeholder="Any"
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
    );
}
