"use client"

import * as React from "react"
import {Input} from "@comend/components/ui/input"
import {Button} from "@comend/components/ui/button"
import {ArrowUpDown, Filter, Settings2} from "lucide-react"
import {DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@comend/components/ui/dropdown-menu"

export default function RequestToolbar() {
    return (
        <div className="space-y-4 flex flex-row items-center justify-between">
            <Input
                placeholder="Search data requests..."
                className="h-8 w-[150px] lg:w-[250px]"
            />
            <div className="flex flex-row items-center space-x-2">

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <Filter className="mr-2 h-4 w-4"/>
                            Filter requests
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>
                            Statuses
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showStatusBar}
                            onCheckedChange={setShowStatusBar}
                        >
                            Status Bar
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showActivityBar}
                            onCheckedChange={setShowActivityBar}
                            disabled
                        >
                            Activity Bar
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showPanel}
                            onCheckedChange={setShowPanel}
                        >
                            Panel
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <ArrowUpDown/>
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuItem
                            className="capitalize"
                        >
                            Recently updated
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="capitalize"
                        >
                            Newest created
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="capitalize"
                        >
                            Oldest created
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
