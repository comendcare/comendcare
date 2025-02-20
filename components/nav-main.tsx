"use client"

import {ChevronRight, type LucideIcon} from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {usePathname} from "next/navigation"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { FaBell, FaCircle, FaPlus } from "react-icons/fa6"

type Item = {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    comingSoon?: boolean
    items?: {
        title: string
        url: string
    }[]
}

export function NavMain({
                            items,
                            notifications
                        }: {
    items: Item[],
    notifications: any
}) {
    const pathname = usePathname()

    return (
        <TooltipProvider>
            <SidebarMenu className="px-2">
                {items.map((item) => {
                    const isActive = pathname === item.url
                    const isComingSoon = item.comingSoon

                    return (
                        <SidebarMenuItem key={item.title}>
                            {isComingSoon ? (
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton
                                            asChild
                                            className="cursor-not-allowed opacity-50"
                                            disabled={isComingSoon}
                                        >
                                            <div className="flex items-center">
                                                {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                                {item.title}
                                            </div>
                                        </SidebarMenuButton>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Coming Soon!
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    className={isActive ? "bg-muted text-primary" : ""}
                                >
                                    {/* <Link href={item.url}>
                                        {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                        {item.title}
                                    </Link> */}
                                    <a href={item.url}>
                                        {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                        {item.title}
                                        <Notification item={item} notifications={notifications}/>
                                    </a>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </TooltipProvider>
    )
}

const Notification = ({item, notifications}: {item: Item, notifications: any}) => {
    // handle kanban
    if (item.title === "Task Board" && notifications.tasks) {
        return (
            <div className="ml-auto flex items-center gap-1 text-red-500 text-sm">
                {/* <FaBell className="h-3 w-3"/> */}
                <FaPlus className="h-2 w-2"/>
                <p className="text-sm">{`${notifications.tasks}`}</p>
                {/* <div className="h-2 w-2 p-1 bg-red-500 rounded-full">
                    <FaBell className="text-white h-3 w-3"/>
                </div> */}
            </div>
        )
    }
}