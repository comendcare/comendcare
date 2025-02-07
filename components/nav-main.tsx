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

export function NavMain({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        comingSoon?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
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