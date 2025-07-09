"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarIcon,
  CircleDashed,
  Clock,
  Ellipsis,
  Globe,
  Lock,
  Pin,
  Text,
} from "lucide-react";
import * as React from "react";
// import { toast } from "sonner";
import { DataTableColumnHeader } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
// import { Badge } from "@comend/components/ui/badge";
// import { Button } from "@comend/components/ui/button";
// import { Checkbox } from "@comend/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
//   DropdownMenuTrigger,
// } from "@comend/components/ui/dropdown-menu";
// import { type Task } from "@prisma/client";
// import { formatDate } from "@comend/lib/format";
// import { getErrorMessage } from "@comend/lib/handle-error";
// import {DataTableRowAction, PRIORITIES, LABELS, STATUSES} from "@comend/components/types/data-table";

import { updateTask } from "../lib/actions";
import { getPriorityIcon, getStatusIcon } from "../lib/utils";
import { Status, Priority } from "@prisma/client";
import { Asset } from "@comend/lib/types";
// import { AssetActionsMenu } from "~/web/components/tool-actions-menu"


interface GetBiosamplesTableColumnsProps {
  // statusCounts: Record<Status, number>;
  // priorityCounts: Record<Priority, number>;
  // estimatedHoursRange: { min: number; max: number };
  // setRowAction: React.Dispatch<
  //   React.SetStateAction<DataTableRowAction<Task> | null>
  // >;
}

export function getBiosamplesTableColumns({
  // statusCounts,
  // priorityCounts,
  // estimatedHoursRange,
  // setRowAction,
}: GetBiosamplesTableColumnsProps): ColumnDef<any>[] {
  return [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      // cell: ({ row }) => {
      //   return (
      //     <div className="flex items-center gap-2">
      //       <span className="max-w-[31.25rem] truncate font-medium">
      //         {row.getValue("title")}
      //       </span>
      //     </div>
      //   );
      // },
      meta: {
        label: "Title",
        placeholder: "Search titles...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="line-clamp-3">
                {row.original.description}
            </div>
        ),
        enableHiding: true,
        enableColumnFilter: true
    },
    {
        id: "private",
        accessorKey: "private",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Visibility" />
        ),
        cell: ({ row }) => (
            <div>
                {row.getValue("private") ? 'Private' : 'Public'}
            </div>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
          label: "Visibility",
          variant: "multiSelect",
          options: [
            {
              label: "Private", 
              value: "true",
              icon: Lock,
            }, {
              label: "Public", 
              value: "false",
              icon: Globe
            }
          ],
          icon: CircleDashed,
        },
    },
    {
        accessorKey: "milestones",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Linked Projects" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.milestones?.map((milestone: any, index: number) => (
                    <li key={index} className="line-clamp-2">
                        {milestone.milestone?.title || undefined}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "tool.contacts",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Contacts" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.contacts?.map((contact: any, index: number) => (
                    <li key={index}>
                        {contact.name || contact.email || contact.affiliation}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "tool.links",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Links" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.attachments?.map((attachment: any, index: number) => (
                    <li key={index} className="line-clamp-2">
                        {attachment.name || attachment.link}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "tool.pinned",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pinned"/>
        ),
        cell: ({ row }) => (
            <>
                {row.original.pinned ? <Pin fill="currentColor" className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}
            </>
        ),
        enableHiding: true,
    },
    // {
    //     id: "actions",
    //     cell: ({ row }) => <AssetActionsMenu tool={row.original}/>,
    //     enableHiding: false,
    //     // meta: { name: "Actions" }
    // },


    // ORIGINAL COLUMNS FROM TASK TABLE -----------------------------------------------------------------------------
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //       className="translate-y-0.5"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //       className="translate-y-0.5"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    //   size: 40,
    // },
    // {
    //   id: "code",
    //   accessorKey: "code",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Task" />
    //   ),
    //   cell: ({ row }) => <div className="w-20">{row.getValue("code")}</div>,
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   id: "title",
    //   accessorKey: "title",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Title" />
    //   ),
    //   cell: ({ row }) => {
    //     const label = LABELS.find(
    //       (label) => label === row.original.label,
    //     );

    //     return (
    //       <div className="flex items-center gap-2">
    //         {label && <Badge variant="outline">{label}</Badge>}
    //         <span className="max-w-[31.25rem] truncate font-medium">
    //           {row.getValue("title")}
    //         </span>
    //       </div>
    //     );
    //   },
    //   meta: {
    //     label: "Title",
    //     placeholder: "Search titles...",
    //     variant: "text",
    //     icon: Text,
    //   },
    //   enableColumnFilter: true,
    // },
    // {
    //   id: "status",
    //   accessorKey: "status",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Status" />
    //   ),
    //   cell: ({ cell }) => {
    //     const status = STATUSES.find(
    //       (status) => status === cell.getValue<Task["status"]>(),
    //     );

    //     if (!status) return null;

    //     const Icon = getStatusIcon(status);

    //     return (
    //       <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
    //         <Icon />
    //         <span className="capitalize">{status}</span>
    //       </Badge>
    //     );
    //   },
    //   meta: {
    //     label: "Status",
    //     variant: "multiSelect",
    //     options: STATUSES.map((status) => ({
    //       label: status.charAt(0).toUpperCase() + status.slice(1),
    //       value: status,
    //       count: statusCounts[status],
    //       icon: getStatusIcon(status),
    //     })),
    //     icon: CircleDashed,
    //   },
    //   enableColumnFilter: true,
    // },
    // {
    //   id: "priority",
    //   accessorKey: "priority",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Priority" />
    //   ),
    //   cell: ({ cell }) => {
    //     const priority = PRIORITIES.find(
    //       (priority) => priority === cell.getValue<Task["priority"]>(),
    //     );

    //     if (!priority) return null;

    //     const Icon = getPriorityIcon(priority);

    //     return (
    //       <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
    //         <Icon />
    //         <span className="capitalize">{priority}</span>
    //       </Badge>
    //     );
    //   },
    //   meta: {
    //     label: "Priority",
    //     variant: "multiSelect",
    //     options: PRIORITIES.map((priority) => ({
    //       label: priority.charAt(0).toUpperCase() + priority.slice(1),
    //       value: priority,
    //       count: priorityCounts[priority],
    //       icon: getPriorityIcon(priority),
    //     })),
    //     icon: ArrowUpDown,
    //   },
    //   enableColumnFilter: true,
    // },
    // {
    //   id: "estimatedHours",
    //   accessorKey: "estimatedHours",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Est. Hours" />
    //   ),
    //   cell: ({ cell }) => {
    //     const estimatedHours = cell.getValue<number>();
    //     return <div className="w-20 text-right">{estimatedHours}</div>;
    //   },
    //   meta: {
    //     label: "Est. Hours",
    //     variant: "range",
    //     range: [estimatedHoursRange.min, estimatedHoursRange.max],
    //     unit: "hr",
    //     icon: Clock,
    //   },
    //   enableColumnFilter: true,
    // },
    // {
    //   id: "createdAt",
    //   accessorKey: "createdAt",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Created At" />
    //   ),
    //   cell: ({ cell }) => formatDate(cell.getValue<Date>()),
    //   meta: {
    //     label: "Created At",
    //     variant: "dateRange",
    //     icon: CalendarIcon,
    //   },
    //   enableColumnFilter: true,
    // },
    // {
    //   id: "actions",
    //   cell: function Cell({ row }) {
    //     const [isUpdatePending, startUpdateTransition] = React.useTransition();

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             aria-label="Open menu"
    //             variant="ghost"
    //             className="flex size-8 p-0 data-[state=open]:bg-muted"
    //           >
    //             <Ellipsis className="size-4" aria-hidden="true" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="w-40">
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, variant: "update" })}
    //           >
    //             Edit
    //           </DropdownMenuItem>
    //           <DropdownMenuSub>
    //             <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
    //             <DropdownMenuSubContent>
    //               <DropdownMenuRadioGroup
    //                 value={row.original.label}
    //                 onValueChange={(value) => {
    //                   startUpdateTransition(() => {
    //                     toast.promise(
    //                       updateTask({
    //                         id: row.original.id,
    //                         label: value as Task["label"],
    //                       }),
    //                       {
    //                         loading: "Updating...",
    //                         success: "Label updated",
    //                         error: (err) => getErrorMessage(err),
    //                       },
    //                     );
    //                   });
    //                 }}
    //               >
    //                 {LABELS.map((label) => (
    //                   <DropdownMenuRadioItem
    //                     key={label}
    //                     value={label}
    //                     className="capitalize"
    //                     disabled={isUpdatePending}
    //                   >
    //                     {label}
    //                   </DropdownMenuRadioItem>
    //                 ))}
    //               </DropdownMenuRadioGroup>
    //             </DropdownMenuSubContent>
    //           </DropdownMenuSub>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, variant: "delete" })}
    //           >
    //             Delete
    //             <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    //   size: 40,
    // },
  ];
}
