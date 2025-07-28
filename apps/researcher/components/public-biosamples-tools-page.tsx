"use client"

import * as React from "react";
import Image from "next/image"
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {BiosamplesTable} from "@comend/components/biorepo/advanced-data-table/biosamples-table/biosamples-table"
import {FeatureFlagsProvider} from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import {
    useBiosamplesTableColumns
} from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import {Tool} from "@prisma/client";
import {Button} from "@comend/components/ui/button";
import {useRouter} from "next/navigation";

export default function PublicBiosampleToolsPage({data, pageCount}: { data: Tool[], pageCount: number }) {
    const router = useRouter()
    const columns = useBiosamplesTableColumns()
    const [selectedItems, setSelectedItems] = React.useState<Tool[]>([]);

    const handleRequestClick = () => {
        const ids = selectedItems.map(item => item.id).join(",");
        router.push(`/toolkit/new-biosample-request?ids=${ids}`);
    }

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
            <div className="w-full flex justify-end mt-2 min-h-[3rem]">
                {selectedItems.length > 0 && (
                    <Button
                        onClick={handleRequestClick}
                    >
                        Request Selected ({selectedItems.length})
                    </Button>
                )}
            </div>
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
                        <BiosamplesTable
                            data={data}
                            pageCount={pageCount}
                            columns={columns}
                            onSelectionChange={setSelectedItems}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}
