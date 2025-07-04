import {
    ArrowDownIcon,
    ArrowUpIcon,
    CaretSortIcon,
    EyeNoneIcon,
} from "@radix-ui/react-icons"
import { Column } from "@tanstack/react-table"

import { cn } from "@comend/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@comend/components/ui/dropdown-menu";
import {DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu";
import {Button} from "@comend/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <span>{title}</span>
        </div>
    )
}
