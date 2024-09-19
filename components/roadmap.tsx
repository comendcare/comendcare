"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {TooltipProvider} from "@/components/ui/tooltip";
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsTrigger, TabsList, TabsContent} from "@/components/ui/tabs";
import {AppNav} from "@/components/app-nav";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";
import {PlateEditor} from "@/components/editor";
import {Cog, Store, User, Workflow} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image"
import logo from "@/public/logos/comend-logo.png"

export function Roadmap() {
    // Zustand state management
    const {defaultLayout, isCollapsed, setIsCollapsed, setLayout} = useNavStore();

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes); // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full items-stretch"
            >
                {/* Navigation Panel */}
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={4}
                    collapsible={true}
                    minSize={15}
                    maxSize={20}
                    onCollapse={() => setIsCollapsed(true)}
                    onResize={() => setIsCollapsed(false)}
                    className={isCollapsed ? "min-w-[50px] transition-all duration-300 ease-in-out" : ""}
                >
                    <div
                        className={cn(
                            "relative flex h-[52px] items-center justify-center",
                            isCollapsed ? "h-[52px]" : "px-2"
                        )}
                    >
                        <Image priority src={logo} alt="Librarey logo" className="size-6"/>
                    </div>
                    <Separator/>
                    <AppNav
                        isCollapsed={isCollapsed}
                        links={[
                            {title: "Roadmap", label: "128", icon: Workflow, variant: "ghost", href: "roadmap"},
                            {title: "Marketplace", label: "9", icon: Store, variant: "ghost", href: "marketplace"},
                            {title: "Profile", icon: User, variant: "ghost", href: "profile"},
                            {title: "Settings", icon: Cog, variant: "ghost", href: "settings"},
                        ]}
                    />
                </ResizablePanel>

                {/* Resizable Handle between panels */}
                <ResizableHandle withHandle/>

                {/* Middle Panel for Kanban and Roadmap */}
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue="roadmap">
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>
                        <TabsContent value="roadmap" className="m-0 h-[calc(100vh-3.5rem)]">
                            <Flow/>
                        </TabsContent>
                        <TabsContent value="kanban">
                            <Kanban/>
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                {/* Another Handle */}
                <ResizableHandle withHandle/>

                {/* Third Panel for the editor */}
                <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
                    <PlateEditor/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
