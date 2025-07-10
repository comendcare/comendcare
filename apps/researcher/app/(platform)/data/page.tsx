import * as React from "react";
import { DataTableSkeleton } from "@/packages/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/tasks-table/shell";
import { getValidFilters } from "@/packages/lib/data-table";
import type { SearchParams } from "@/packages/components/types";

import {FeatureFlagsProvider} from "@/packages/components/biorepo/advanced-data-table/tasks-table/feature-flags-provider";
import { TasksTable } from "@/packages/components/biorepo/advanced-data-table/tasks-table/tasks-table";
import {
    getEstimatedHoursRange,
    getTaskPriorityCounts,
    getTaskStatusCounts,
    getTasks,
} from "@/packages/components/biorepo/advanced-data-table/lib/queries";
import { searchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const validFilters = getValidFilters(search.filters);

    const promises = Promise.all([
        getTasks({
            ...search,
            filters: validFilters,
        }),
        getTaskStatusCounts(),
        getTaskPriorityCounts(),
        getEstimatedHoursRange(),
    ]);

    return (
        <Shell className="gap-2">
            <FeatureFlagsProvider>
                <React.Suspense
                    fallback={
                        <DataTableSkeleton
                            columnCount={7}
                            filterCount={2}
                            cellWidths={[
                                "10rem",
                                "30rem",
                                "10rem",
                                "10rem",
                                "6rem",
                                "6rem",
                                "6rem",
                            ]}
                            shrinkZero
                        />
                    }
                >
                    <TasksTable promises={promises} />
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
    );
}
