"use client"
import {useEffect} from "react"
import * as React from "react"
import {
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnFiltersState,
    SortingState,
    VisibilityState, Row,
} from "@tanstack/react-table"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@comend/components/ui/table"
import {ArrowUpDown, ChevronDown, Paperclip, Trash} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import {toast} from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@comend/components/ui/select"
import {Table as TanstackTable} from "@tanstack/react-table"
import {DotsHorizontalIcon} from "@radix-ui/react-icons";
import {removeEmailFromWhitelist, removeProviderContactRequest} from "~admin/lib/actions"
import {getCompanyContactRequests, getUserWhitelist} from "~admin/lib/fetchers"
import {Company, Organization, Service, RFP} from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@comend/components/ui/dialog"
import {Badge} from "@comend/components/ui/badge";

interface DataTablePaginationProps<TData> {
    table: TanstackTable<TData>
}

export type CompanyContactRequest = {
    id: string
    organization: Organization
    company: Company
    services: Service[]
    rfps: RFP[]
    description: string
    createdAt: Date
}

const columns: ColumnDef<CompanyContactRequest>[] = [
    {
        accessorFn: (row) => row.organization?.name ?? "",
        id: "organization",
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Organization
                <ArrowUpDown/>
            </Button>
        ),
        cell: ({row}) => (
            <div className="normal-case">
                {row.getValue("organization")}
            </div>
        ),
    },
    {
        accessorFn: (row) => row.company?.title ?? "",
        id: "company",
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Company
                <ArrowUpDown/>
            </Button>
        ),
        cell: ({row}) => (
            <div className="normal-case">
                {row.getValue("company")}
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Added On",
        cell: ({row}) => {
            const date = new Date(row.getValue("createdAt"))
            return date.toLocaleDateString()
        },
    },
    {
        id: "actions",
        cell: ({row}) => <div className="justify-self-end">
            <ProviderContactRequestDataTableRowActions row={row}/>
        </div>,
    },
]

export function ProviderContactRequestDataTablePagination<TData>({
                                                                     table,
                                                                 }: DataTablePaginationProps<TData>) {
    return (
        <div className="w-full flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize}/>
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft/>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft/>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight/>
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight/>
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function ProviderContactRequestDataTableRowActions<TData>({
                                                                     row,
                                                                 }: DataTableRowActionsProps<TData>) {
    const id = (row.original as { id: string }).id;

    const onDeleteClick = async () => {
        try {
            const response = await removeProviderContactRequest(id);

            if (response.success) {
                toast.success("Successfully deleted provider contact request.");
            } else {
                toast.error(response.error || "An error occurred while deleting provider contact request.");
            }
        } catch (error) {
            console.error("Provider contact request deletion error:", error);
            toast.error("An error occurred while deleting provider contact request..");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4"/>
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                    onClick={onDeleteClick}
                >
                    <Trash/>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function ProviderContactRequestDataTable() {
    const [data, setData] = React.useState<CompanyContactRequest[]>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [selectedRow, setSelectedRow] = React.useState<CompanyContactRequest | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    useEffect(() => {
        async function fetchData() {
            const response = await getCompanyContactRequests({
                id: true,
                organization: true,
                company: true,
                services: true,
                rfps: true,
                description: true,
                createdAt: true
            });
            if (response.success) {
                setData(response.data ?? [])
            } else {
                console.error(response.error);
                toast.error(response.error)
            }
        }

        fetchData();
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Filter organizations..."
                        value={(table.getColumn("organization")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("organization")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        onClick={() => {
                                            setSelectedRow(row.original)
                                            setIsDialogOpen(true)
                                        }}
                                        className="cursor-pointer hover:bg-muted"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center h-24">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end space-x-2 py-4">
                    <ProviderContactRequestDataTablePagination table={table}/>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contact Request Details</DialogTitle>
                        <DialogDescription>
                            View request information below.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRow && (
                        <div>
                            <div className="mt-6 border-t border-gray-100">
                                <dl className="divide-y divide-gray-100">
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm/6 font-medium text-gray-900">
                                            Organization name
                                        </dt>
                                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {selectedRow.organization.name}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm/6 font-medium text-gray-900">
                                            Company name
                                        </dt>
                                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {selectedRow.company.title}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm/6 font-medium text-gray-900">
                                            Requested services
                                        </dt>
                                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {selectedRow.services?.map((service, index) => <Badge
                                                    key={index}
                                                    variant={"default"}
                                                >
                                                    {service.name}
                                                </Badge>
                                            )}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm/6 font-medium text-gray-900">
                                            Attached RFPs
                                        </dt>
                                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {selectedRow.rfps?.map((rfp, index) => <Badge
                                                    key={index}
                                                    variant={"default"}
                                                >
                                                    {rfp.title}
                                                </Badge>
                                            )}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm/6 font-medium text-gray-900">
                                            Description
                                        </dt>
                                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {selectedRow.description}
                                        </dd>
                                    </div>
                                    {/*<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">*/}
                                    {/*    <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>*/}
                                    {/*    <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">*/}
                                    {/*        <ul role="list"*/}
                                    {/*            className="divide-y divide-gray-100 rounded-md border border-gray-200">*/}
                                    {/*            <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">*/}
                                    {/*                <div className="flex w-0 flex-1 items-center">*/}
                                    {/*                    <Paperclip aria-hidden="true"*/}
                                    {/*                               className="size-5 shrink-0 text-gray-400"/>*/}
                                    {/*                    <div className="ml-4 flex min-w-0 flex-1 gap-2">*/}
                                    {/*                        <span*/}
                                    {/*                            className="truncate font-medium text-gray-900">resume_back_end_developer.pdf</span>*/}
                                    {/*                        <span className="shrink-0 text-gray-400">2.4mb</span>*/}
                                    {/*                    </div>*/}
                                    {/*                </div>*/}
                                    {/*                <div className="ml-4 shrink-0">*/}
                                    {/*                    <a href="#"*/}
                                    {/*                       className="font-medium text-indigo-600 hover:text-indigo-500">*/}
                                    {/*                        Download*/}
                                    {/*                    </a>*/}
                                    {/*                </div>*/}
                                    {/*            </li>*/}
                                    {/*            <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">*/}
                                    {/*                <div className="flex w-0 flex-1 items-center">*/}
                                    {/*                    <Paperclip aria-hidden="true"*/}
                                    {/*                               className="size-5 shrink-0 text-gray-400"/>*/}
                                    {/*                    <div className="ml-4 flex min-w-0 flex-1 gap-2">*/}
                                    {/*                        <span*/}
                                    {/*                            className="truncate font-medium text-gray-900">coverletter_back_end_developer.pdf</span>*/}
                                    {/*                        <span className="shrink-0 text-gray-400">4.5mb</span>*/}
                                    {/*                    </div>*/}
                                    {/*                </div>*/}
                                    {/*                <div className="ml-4 shrink-0">*/}
                                    {/*                    <a href="#"*/}
                                    {/*                       className="font-medium text-indigo-600 hover:text-indigo-500">*/}
                                    {/*                        Download*/}
                                    {/*                    </a>*/}
                                    {/*                </div>*/}
                                    {/*            </li>*/}
                                    {/*        </ul>*/}
                                    {/*    </dd>*/}
                                    {/*</div>*/}
                                </dl>
                            </div>
                        </div>
                    )}
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </>
    )
}
