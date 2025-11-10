"use client"
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
import {ArrowUpDown, ChevronDown, Trash} from "lucide-react"
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
import {createInstitution, deleteFacilityCreateRequest, removeProviderContactRequest} from "~admin/lib/actions"
import type {Biosample, DiseaseModel, Milestone, Tool} from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
    DialogTrigger,
} from "@comend/components/ui/dialog"
import z from "zod"
import { Option, BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS } from "@/packages/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "@comend/components/ui/form"
import MultipleSelector from "@/packages/components/ui/multiple-selector"
import { FacilityType, institutionFormSchema } from "~admin/lib/types"
import { useState } from "react"
import { CreateCompanyForm } from "../create-company-dialog"
import { ScrollArea, ScrollBar } from "@/packages/components/ui/scroll-area"

interface DataTablePaginationProps<TData> {
    table: TanstackTable<TData>
}

export type FacilityCreateRequest = {
    id: string
    cratedAt: string
    updatedAt: string
    name: string
    milestoneId: string,
    milestone: Milestone,
    biosampleId: string
    biosample: Biosample
    diseaseModelId: string
    diseaseModel: DiseaseModel
    clinicalDatasetId: string
    clinicalDataset: Tool
}

const columns: ColumnDef<FacilityCreateRequest>[] = [
    {
        accessorFn: (row) => row.name ?? "",
        id: "name",
        header: ({column}) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Company
                <ArrowUpDown />
            </Button>
        ),
        cell: ({row}) => (
            <div className="normal-case">
                {row.getValue("name")}
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
            <FacilityCreateRequestDataTableRowActions row={row}/>
        </div>,
    },
]

export function FacilityCreateRequestDataTablePagination<TData>({table}: DataTablePaginationProps<TData>) {
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

export function FacilityCreateRequestDataTableRowActions<TData>({
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

export function FacilityCreateRequestDataTable({data}: {data: FacilityCreateRequest[]}) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [selectedRow, setSelectedRow] = React.useState<FacilityCreateRequest | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

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
                    <FacilityCreateRequestDataTablePagination table={table}/>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Facility Creation Details</DialogTitle>
                        <DialogDescription>
                            View request information below.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRow && (
                        <CreateFacilityForm 
                            request={selectedRow}
                            dialogClose={() => setIsDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export const CreateFacilityForm = ({
    request,
    dialogClose
}: {
    request: FacilityCreateRequest,
    dialogClose?: () => void
}) => {
    const [type, setType] = useState<FacilityType>('cro')
    const handleDeleteRequest = async () => {
        if (!request.id) {
            toast.error(
                "This request does not have an id.",
                {position: "bottom-left"}
            )
            return
        }

        try {
            await deleteFacilityCreateRequest(request.id)
            if (dialogClose) dialogClose()
            toast(
                <div className="flex flex-col gap-2 w-full">
                    <span className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">
                            {`Request deleted`}
                        </p>
                    </span>
                    <p className="text-sm text-gray-500">
                        {`Your request had been deleted successfully.`}
                    </p>
                </div>,
                {position: "bottom-left", duration: 20000}
            )
        } catch (error) {
            console.error("Error deleting request:", error);
            toast.error(
                "Failed to delete request.",
                {position: "bottom-left"}
            );
        }
    }

    const TYPE_OPTIONS = [
        {value: 'cro', label: 'CRO/Service Provider'},
        {value: 'institution', label: 'Institution'},
    ]

    return (
        <ScrollArea className="max-h-[60vh] pr-2">
        <ScrollBar />
        <div className="p-1">
            <Select
                value={type} 
                onValueChange={(newVal: FacilityType) => setType(newVal)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a value" />
                </SelectTrigger>
                <SelectContent>
                    {TYPE_OPTIONS.map((option, index) => (
                        <SelectItem key={index} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {type === 'cro' ? (
            <CreateCompanyForm 
                request={request}
                onCloseCallback={async () => {
                    await handleDeleteRequest()
                    if (dialogClose) dialogClose()
                }}
                handleRequestDeleteCallback={handleDeleteRequest}
            />
        ) : (
            <CreateInstitutionForm 
                request={request}
                onCloseCallback={async () => {
                    await handleDeleteRequest()
                    if (dialogClose) dialogClose()
                }}
                handleRequestDeleteCallback={handleDeleteRequest}
            />
        )}
        </ScrollArea>
    )
}

export function CreateInstitutionForm({
    request, 
    onCloseCallback,
    handleRequestDeleteCallback
}: {
    request?: FacilityCreateRequest, 
    onCloseCallback?: () => void,
    handleRequestDeleteCallback?: () => void,
}) {
    const [loading, setLoading] = useState(false)
    const form = useForm<z.infer<typeof institutionFormSchema>>({
        resolver: zodResolver(institutionFormSchema),
        defaultValues: {
            name: request?.name ?? "",
            milestones: request?.milestone 
                ? ([{
                    value: request.milestone.id,
                    type: 'Project',
                    label: request.milestone.id,
                    milestone: request.milestone
                }]) 
                : ([]),
            tools: request 
                ? [
                    request.biosample ? {
                        value: request.biosample.id,
                        type: 'Biosamples',
                        icon: 'test-tube-diagonal',
                        // img: `https://api.dicebear.com/8.x/shapes/svg?seed=${biosample.donorId}`,
                        label: `${request.biosample.id} - ${(BIOSAMPLE_TYPE_OPTIONS.filter((option: Option) => request.biosample.types?.includes(option.value)))?.map((option: Option) => option?.label)?.join(', ')}`,
                        biosample: request.biosample
                    } : undefined,
                    request.diseaseModel ? {
                        value: request.diseaseModel.id,
                        label: `${request.diseaseModel.id} - ${(DISEASE_MODEL_TYPE_OPTIONS.filter((option: Option) => request.diseaseModel.types?.includes(option.value)))?.map((option: Option) => option?.label)?.join(', ')}`,
                        icon: 'rat',
                        type: 'Disease Models',
                        diseaseModel: request.diseaseModel
                    } : undefined,
                    request.clinicalDataset ? {
                        value: request.clinicalDataset.id,
                        label: `${request.clinicalDataset.id} - ${request.clinicalDataset.title}`,
                        icon: 'database',
                        type: 'Clinical Datasets',
                        datasample: request.clinicalDataset,
                    } : undefined
                ].filter(option => option !== undefined) 
                : [],
        },
    })

    const handleToolAsyncSearch = async (query: string): Promise<Option[]> => {
        const toolsResponse = await fetch(`/api/tools?search=${query}`)
        const toolsData = await toolsResponse.json()

        return toolsData
    }

    const handleProjectAsyncSearch = async (query: string): Promise<Option[]> => {
        const toolsResponse = await fetch(`/api/milestones?search=${query}`)
        const toolsData = await toolsResponse.json()

        return toolsData
    }

    const handleSubmit = async (values: z.infer<typeof institutionFormSchema>) => {
        setLoading(true)
        try {
            const response = await createInstitution(values)

            if (response.success) {
                toast.success("Institution created successfully")
                form.reset()
                if (onCloseCallback) onCloseCallback()
            } else {
                toast.error(response.error || "An error occurred while creating the Institution.")
            }
        } catch (error) {
            console.error("Create Institution error:", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 p-1 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Institution Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="milestones"
                    render={({field}) => (
                        <FormItem className="w-full">
                            <FormLabel>{`Linked Projects`}</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    onSearch={handleProjectAsyncSearch}
                                    hidePlaceholderWhenSelected={true}
                                    showHoverCard={false}
                                    placeholder="Search..."
                                    badgeClassName="border-transparent bg-green-100 text-green-900"
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                />
                            </FormControl>
                            <FormMessage className="text-primary"/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tools"
                    render={({field}) => (
                        <FormItem className="w-full">
                            <FormLabel>{`Linked Tools`}</FormLabel>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    onSearch={handleToolAsyncSearch}
                                    hidePlaceholderWhenSelected={true}
                                    showHoverCard={false}
                                    placeholder="Search..."
                                    badgeClassName="border-transparent bg-green-100 text-green-900"
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    groupBy={'type'}
                                />
                            </FormControl>
                            <FormMessage className="text-primary"/>
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"secondary"}>
                            Cancel
                        </Button>
                    </DialogClose>
                    {(request && handleRequestDeleteCallback) && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="destructive">
                                    Delete request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {`This action cannot be undone. This will permanently delete your request and it's data.`}
                                    </DialogDescription>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button type="button">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <DialogClose>
                                            <Button
                                                type="button"
                                                variant={"destructive"}
                                                onClick={() => handleRequestDeleteCallback()}
                                            >
                                                Delete request
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create institution"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}
