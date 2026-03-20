"use client"

import {type LucideIcon} from "lucide-react"
import {
    SidebarMenu, SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem, useSidebar,
} from "@comend/components/ui/sidebar"
import {usePathname} from "next/navigation"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@comend/components/ui/tooltip"
import Link from "next/link"

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
    badge?: string | number,
    notificationKeys?: string[],
    subPages?: Item[]
    match?: (pathname: string) => boolean
}

export function NavMain({items}: { items: Item[] }) {
    const pathname = usePathname()
    const {state} = useSidebar()

    return (
        <SidebarMenu>
            {items.map((item) => {
                // const isActive = pathname === item.url
                const isActive = item.match ? item.match(pathname) : pathname === item.url
                const badge = item.badge
                const isComingSoon = item.comingSoon

                return (
                    <SidebarMenuItem key={item.title}>
                        {isComingSoon ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <>
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
                                        <SidebarMenuBadge>
                                            <div
                                                aria-hidden="true"
                                                className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs/5 font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                                            >
                                                {badge}
                                            </div>
                                        </SidebarMenuBadge>
                                    </>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Coming soon
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                className={isActive ? "bg-blue-light border border-blue-dark text-primary" : ""}
                            >
                                <Link href={item.url} className="flex">
                                    <div className="relative">
                                        {item.icon && <item.icon className="mr-2 h-4 w-4"/>}
                                    </div>
                                    {item.title}
                                </Link>
                            </SidebarMenuButton>
                        )}
                        {(item?.subPages || []).map((subItem) => (
                            <SidebarMenuSub key={subItem.title}>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        className={pathname === subItem.url ? "bg-blue-light text-primary" : ""}
                                    >
                                        <Link href={subItem.url} className="flex">
                                            <div className="relative">
                                                {subItem.icon && <subItem.icon className="mr-2 h-4 w-4"/>}
                                            </div>
                                            {subItem.title}
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        ))}
                    </SidebarMenuItem>
                )
            })}
        </SidebarMenu>
    )
}
