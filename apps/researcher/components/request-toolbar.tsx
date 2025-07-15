"use client"

import * as React from "react"
import {Input} from "@comend/components/ui/input"
import {Button} from "@comend/components/ui/button"
import {Filter, Settings2} from "lucide-react"
import {DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
                <Button variant="outline" className="ml-auto hidden h-8 lg:flex">
                    <Filter className="mr-2 h-4 w-4"/>
                    Filter requests
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <Settings2/>
                            View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuCheckboxItem
                            className="capitalize"
                        >
                            View option 1
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
