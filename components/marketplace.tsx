"use client"

import * as React from "react"
import {
    User,
    Store,
    Workflow, Cog,
} from "lucide-react"

import {cn} from "@/lib/utils"
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsTrigger, TabsList, TabsContent} from "@/components/ui/tabs";
import {TooltipProvider} from "@/components/ui/tooltip";
import {AppNav} from "@/components/app-nav";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";

interface MarketplaceProps {
    defaultLayout: number[] | undefined
    defaultCollapsed?: boolean
    navCollapsedSize: number
}

export function Marketplace({
                                defaultCollapsed = false,
                                navCollapsedSize,
                            }: MarketplaceProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout:platform=${JSON.stringify(
                        sizes
                    )}`
                }}
                className="h-full items-stretch"
            >
                <ResizablePanel
                    defaultSize={20}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={20}
                    onCollapse={() => {
                        setIsCollapsed(true)
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                            true
                        )}`
                    }}
                    onResize={() => {
                        setIsCollapsed(false)
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                            false
                        )}`
                    }}
                    className={cn(
                        isCollapsed &&
                        "min-w-[50px] transition-all duration-300 ease-in-out"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-[52px] items-center justify-center",
                            isCollapsed ? "h-[52px]" : "px-2"
                        )}
                    >
                        {/*<AccountSwitcher isCollapsed={isCollapsed} accounts={accounts}/>*/}
                    </div>
                    <Separator/>
                    <AppNav
                        isCollapsed={isCollapsed}
                        links={[
                            {
                                title: "Roadmap",
                                label: "128",
                                icon: Workflow,
                                variant: "ghost",
                                href: "roadmap"
                            },
                            {
                                title: "Marketplace",
                                label: "9",
                                icon: Store,
                                variant: "ghost",
                                href: "marketplace"
                            },
                            {
                                title: "Profile",
                                label: "",
                                icon: User,
                                variant: "ghost",
                                href: "profile"
                            },
                            {
                                title: "Settings",
                                label: "",
                                icon: Cog,
                                variant: "ghost",
                                href: "settings"
                            }
                        ]}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={80} minSize={30}>
                    <Flow/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}