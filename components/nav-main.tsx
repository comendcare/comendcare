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
    SidebarMenuSubItem, useSidebar,
} from "@/components/ui/sidebar"
import {usePathname} from "next/navigation"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import {FaBell, FaCircle, FaPlus} from "react-icons/fa6"
import {NotificationsState, useNotificationsStore} from "@/state/notifications/notificationsStore"
import {useShallow} from "zustand/react/shallow"

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

export function NavMain({items}: { items: Item[] }) {
    const pathname = usePathname()
    const {state} = useSidebar()

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
                                        <div className="relative">
                                            {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                            {state === "collapsed" &&
                                                <NavNotificationCollapsedIcon item={item}/>
                                            }
                                        </div>
                                        {item.title}
                                        {state === "expanded" &&
                                            <NavNotificationExpandedIcon item={item}/>
                                        }
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

const NavNotificationCollapsedIcon = ({item}: { item: Item }) => {
    const {
        notifications
    } = useNotificationsStore(useShallow(notificationsSelector))

    const filteredNotifications = notifications
        .filter(notification => (item?.notificationKeys || []).includes(notification.type))
        .filter(notification => !notification.lastViewedAt)

    if (filteredNotifications.length > 0) {
        return (
            <div className="ml-auto flex items-center gap-1 text-sm">
                <span className="absolute top-0 right-0 -mt-1 flex h-2 w-2">
                    <span
                        className="absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                </span>
            </div>
        )
    }
}

const NavNotificationExpandedIcon = ({item}: { item: Item }) => {
    const {
        notifications
    } = useNotificationsStore(useShallow(notificationsSelector))

    const filteredNotifications = notifications
        .filter(notification => (item?.notificationKeys || []).includes(notification.type))
        .filter(notification => !notification.lastViewedAt)

    if (filteredNotifications.length > 0) {
        return (
            <div className="ml-auto flex items-center gap-1 text-sm">
                <p
                    aria-hidden="true"
                    className="relative ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs/5 font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                >
                    {`${filteredNotifications.length > 10 ? 10 : filteredNotifications.length}`} {filteredNotifications.length > 10 && "+"}
                    <span className="absolute top-0 right-0 -mt-.5 -mr-.5 flex h-2 w-2">
                        <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                </p>
            </div>
        )
    }
}
