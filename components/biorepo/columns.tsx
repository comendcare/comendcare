"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, priorities, statuses } from "@/data/pharma-data/data"
import { Biosample } from "@/data/pharma-data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Biosample>[] = [
  {
    id: "select",
    header: ({ table }) => (
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
    cell: ({ row }) => (
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
  // {
  //   accessorKey: "id",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Task" />
  //   ),
  //   cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: "title",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Title" />
  //   ),
  //   cell: ({ row }) => {
  //     const label = labels.find((label) => label.value === row.original.label)
  //
  //     return (
  //       <div className="flex items-center space-x-2">
  //         {label && <Badge>{label.label}</Badge>}
  //         <span className="max-w-[500px] truncate font-medium">
  //           {row.getValue("title")}
  //         </span>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     const status = statuses.find(
  //       (status) => status.value === row.getValue("status")
  //     )
  //
  //     if (!status) {
  //       return null
  //     }
  //
  //     return (
  //       <div className="flex w-[100px] items-center">
  //         {status.icon && (
  //           <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{status.label}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  // {
  //   accessorKey: "priority",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Priority" />
  //   ),
  //   cell: ({ row }) => {
  //     const priority = priorities.find(
  //       (priority) => priority.value === row.getValue("priority")
  //     )
  //
  //     if (!priority) {
  //       return null
  //     }
  //
  //     return (
  //       <div className="flex items-center">
  //         {priority.icon && (
  //           <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{priority.label}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
  {
    accessorKey: "type",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "diagnoses",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Diagnoses" />
    ),
    cell: ({ row }) => <div>{row.getValue("diagnoses")}</div>,
  },
  {
    accessorKey: "institution",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution" />
    ),
    cell: ({ row }) => <div>{row.getValue("institution")}</div>,
  },
  {
    accessorKey: "pathology",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pathology" />
    ),
    cell: ({ row }) => <div>{row.getValue("pathology")}</div>,
  },
  {
    accessorKey: "preservationMethod",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preservation Method" />
    ),
    cell: ({ row }) => <div>{row.getValue("preservationMethod")}</div>,
  },
  {
    accessorKey: "preservation",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preservation" />
    ),
    cell: ({ row }) => <div>{row.getValue("preservation")}</div>,
  },
  {
    accessorKey: "donorAge",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor Age" />
    ),
    cell: ({ row }) => <div>{row.getValue("donorAge")}</div>,
  },
  {
    accessorKey: "donorSex",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor Sex" />
    ),
    cell: ({ row }) => <div>{row.getValue("donorSex")}</div>,
  },
  {
    accessorKey: "clinicalData",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Clinical Data" />
    ),
    cell: ({ row }) => <div>{row.getValue("clinicalData")}</div>,
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => <div>{row.getValue("country")}</div>,
  },
  {
    accessorKey: "donorRace",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Donor Race" />
    ),
    cell: ({ row }) => <div>{row.getValue("donorRace")}</div>,
  },
  {
    accessorKey: "treatments",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Treatments" />
    ),
    cell: ({ row }) => <div>{row.getValue("treatments")}</div>,
  },
  {
    accessorKey: "pmi",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PMI" />
    ),
    cell: ({ row }) => <div>{row.getValue("pmi")}</div>,
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Volume" />
    ),
    cell: ({ row }) => <div>{row.getValue("volume")}</div>,
  },
  {
    accessorKey: "mass",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mass" />
    ),
    cell: ({ row }) => <div>{row.getValue("mass")}</div>,
  },
  {
    accessorKey: "area",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Area" />
    ),
    cell: ({ row }) => <div>{row.getValue("area")}</div>,
  },
]
