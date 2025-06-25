"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {DataTableColumnHeader} from "./data-table-column-header"

export const columns: ColumnDef<any>[] = [
    {
        id: "select",
        header: ({table}) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: ({column}) => <DataTableColumnHeader column={column} title="Type"/>,
        cell: ({row}) => <div>{row.getValue("type")}</div>,
    },
    {
        accessorKey: "title",
        header: ({column}) => <DataTableColumnHeader column={column} title="Title"/>,
        cell: ({row}) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "institution",
        header: ({column}) => <DataTableColumnHeader column={column} title="Institution"/>,
        cell: ({row}) => <div>{row.getValue("institution")}</div>,
    },
    {
        accessorKey: "principalInvestigator",
        header: ({column}) => <DataTableColumnHeader column={column} title="PI"/>,
        cell: ({row}) => <div>{row.getValue("principalInvestigator")}</div>,
    },
    {
        accessorKey: "country",
        header: ({column}) => <DataTableColumnHeader column={column} title="Country"/>,
        cell: ({row}) => <div>{row.getValue("country")}</div>,
    },
    {
        accessorKey: "numberOfPatients",
        header: ({column}) => <DataTableColumnHeader column={column} title="# Patients"/>,
        cell: ({row}) => <div>{row.getValue("numberOfPatients")}</div>,
    },
    {
        accessorKey: "startDate",
        header: ({column}) => <DataTableColumnHeader column={column} title="Start Date"/>,
        cell: ({row}) => <div>{row.getValue("startDate")}</div>,
    },
    {
        accessorKey: "endDate",
        header: ({column}) => <DataTableColumnHeader column={column} title="End Date"/>,
        cell: ({row}) => <div>{row.getValue("endDate")}</div>,
    },
    // {
    //     accessorKey: "summary",
    //     header: ({column}) => <DataTableColumnHeader column={column} title="Summary"/>,
    //     cell: ({row}) => <div className="line-clamp-2 max-w-[400px]">{row.getValue("summary")}</div>,
    // },
    {
        accessorKey: "published",
        header: ({column}) => <DataTableColumnHeader column={column} title="Published"/>,
        cell: ({row}) => <div>{row.getValue("published") ? "Yes" : "No"}</div>,
    },
    {
        accessorKey: "doi",
        header: ({column}) => <DataTableColumnHeader column={column} title="DOI"/>,
        cell: ({row}) => {
            const doi = row.getValue("doi");
            return doi ?
                <a href={doi as string} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Link</a> :
                <span className="text-muted-foreground">N/A</span>;
        },
    },
]
