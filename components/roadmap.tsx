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
import {PlateEditor} from "@/components/editor";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";

interface RoadmapProps {
    defaultLayout: number[] | undefined
    defaultCollapsed?: boolean
    navCollapsedSize: number
}

export function Roadmap({
                             defaultLayout = [20, 32, 48],
                             defaultCollapsed = false,
                             navCollapsedSize,
                         }: RoadmapProps) {
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
                    defaultSize={defaultLayout[0]}
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
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue="roadmap">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger
                                    value="roadmap"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    Roadmap
                                </TabsTrigger>
                                <TabsTrigger
                                    value="kanban"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    Kanban
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator/>
                        <TabsContent value="roadmap" className="m-0 h-[calc(100vh-3.5rem)]">
                            <Flow/>
                        </TabsContent>
                        <TabsContent value="kanban" className="m-0">
                            <Kanban/>
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
                    <PlateEditor/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}