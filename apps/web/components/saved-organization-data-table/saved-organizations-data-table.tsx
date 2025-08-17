"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@comend/components/ui/table";
import { SavedOrganizationData } from "@/packages/lib/types"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { PulsatingButton } from "@/packages/components/ui/pulsating-button"
import Image from "next/image"

interface DataTableProps<TValue> {
    columns: ColumnDef<SavedOrganizationData, TValue>[]
    data: SavedOrganizationData[]
}

export function SavedOrganizationsDataTable<TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const router = useRouter()

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [overlayStyle, setOverlayStyle] = useState({ width: 0 });

    useEffect(() => {
        const updateOverlay = () => {
            if (scrollContainerRef.current) {
                const widthRect = scrollContainerRef.current.getBoundingClientRect();
                setOverlayStyle({width: widthRect.width});
            }
        };

        updateOverlay();
        window.addEventListener("resize", updateOverlay);
        return () => window.removeEventListener("resize", updateOverlay);
    }, []);

    return (
        <div className="space-y-4 w-full min-w-full">
            <DataTableToolbar table={table} />
            <div className="rounded-md border" ref={scrollContainerRef}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {/* no results overlay */}
                        <div
                            className="text-center fixed flex justify-center items-center"
                            style={{width: overlayStyle.width}}
                        >
                            {!table.getRowModel().rows?.length &&
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <Image
                                        alt="No patient groups shortlisted"
                                        src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                                        width={300}
                                        height={300}
                                        className="dark:hidden"
                                    />
                                    <Image
                                        alt="No patient groups shortlisted"
                                        src="https://illustrations.popsy.co/white/digital-nomad.svg"
                                        width={300}
                                        height={300}
                                        className="hidden dark:block"
                                    />
                                    <div className="max-w-xl flex flex-col justify-center items-center space-y-8">
                                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                                            {`You do not have any shortlisted patient groups yet. Visit the marketplace to save some patient groups.`}
                                        </p>
                                        <PulsatingButton
                                            className="bg-blue-dark"
                                            pulseColor={"#dcebfe"}
                                            onClick={() => router.push("/app/marketplace/patient-groups")}
                                        >
                                            Visit marketplace
                                        </PulsatingButton>
                                    </div>
                                </div>
                            }
                        </div>

                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        const href = process.env.NEXT_PUBLIC_VERCEL_ENV
                                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${row.original.savedOrganization.subdomain}`
                                            : `http://localhost:3000/app/organization/${row.original.savedOrganization.subdomain}`
                                        router.push(href)
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // <TableRow>
                            //     <TableCell
                            //         colSpan={columns.length}
                            //         className="h-24 text-center"
                            //     >
                            //         No results.
                            //     </TableCell>
                            // </TableRow>
                            <TableRow className="invisible">
                                <TableCell colSpan={columns.length}>
                                    <div className="h-full flex flex-col items-center justify-center py-20">
                                        <Image
                                            alt="No patient groups shortlisted"
                                            src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                                            width={300}
                                            height={300}
                                            className="dark:hidden"
                                        />
                                        <Image
                                            alt="No patient groups shortlisted"
                                            src="https://illustrations.popsy.co/white/digital-nomad.svg"
                                            width={300}
                                            height={300}
                                            className="hidden dark:block"
                                        />
                                        <div className="max-w-xl flex flex-col justify-center items-center space-y-8">
                                            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                                                {`You do not have any shortlisted patient groups yet. Visit the marketplace to save some patient groups.`}
                                            </p>
                                            <PulsatingButton
                                                className="bg-black"
                                                pulseColor={"#9ca3af"}
                                                onClick={() => router.push("/app/marketplace/patient-groups")}
                                            >
                                                Visit marketplace
                                            </PulsatingButton>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}
