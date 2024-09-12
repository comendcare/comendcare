"use client"

import * as React from "react"
import {
    User,
    Search,
    Store,
    Workflow,
} from "lucide-react"

import {cn} from "@/lib/utils"
import {Input} from "@/components/ui/input"
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsTrigger, TabsList, TabsContent} from "@/components/ui/tabs";
import {TooltipProvider} from "@/components/ui/tooltip";
import {AppNav} from "@/components/app-nav";

interface MailProps {
    defaultLayout: number[] | undefined
    defaultCollapsed?: boolean
    navCollapsedSize: number
}

export function Mail({
                         defaultLayout = [20, 32, 48],
                         defaultCollapsed = false,
                         navCollapsedSize,
                     }: MailProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
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
                        ]}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue="all">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger
                                    value="all"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    All mail
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unread"
                                    className="text-zinc-600 dark:text-zinc-200"
                                >
                                    Unread
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator/>
                        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input placeholder="Search" className="pl-8"/>
                                </div>
                            </form>
                        </div>
                        <TabsContent value="all" className="m-0">
                        </TabsContent>
                        <TabsContent value="unread" className="m-0">
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}