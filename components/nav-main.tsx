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
import { NotificationsState, useNotificationsStore } from "@/state/notifications/notificationsStore"
import { useShallow } from "zustand/react/shallow"

type Item = {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    comingSoon?: boolean
    items?: {
        title: string
        url: string
    }[],
    notificationKeys?: string[]
}

const notificationsSelector = (state: NotificationsState) => ({
    notifications: state.notifications
})

export function NavMain({items}: {items: Item[]}) {
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
                                    <a href={item.url}>
                                        {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                        {item.title}
                                        <NavNotificationIcon item={item}/>
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

const NavNotificationIcon = ({item}: {item: Item}) => {
    const {
        notifications
    } = useNotificationsStore(useShallow(notificationsSelector))

    const filteredNotifications = notifications
        .filter(notification => (item?.notificationKeys || []).includes(notification.type))
        .filter(notification => !notification.lastViewedAt)

    if (filteredNotifications.length > 0) {
        return (
            <div className="ml-auto flex items-center gap-1 text-red-500 text-sm">
                <FaBell className="h-3 w-3"/>
                <FaPlus className="h-2 w-2"/>
                <p className="text-sm">{`${filteredNotifications.length}`}</p>
                {/* <div className="h-2 w-2 p-1 bg-red-500 rounded-full">
                    <FaBell className="text-white h-3 w-3"/>
                </div> */}
            </div>
        )
    }
}