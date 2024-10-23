"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {TooltipProvider} from "@/components/ui/tooltip";
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {AppNav} from "@/components/app-nav";
import {Cog, Store, User, Workflow} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/logos/comend-logo.png";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({children}: AppLayoutProps) {
    // Zustand state management
    const {defaultLayout, isCollapsed, setIsCollapsed, setLayout} = useNavStore();

    return (
        <div className="flex h-full w-full">
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes); // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full w-full items-stretch"
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
                            {title: "Roadmap", label: "128", icon: Workflow, variant: "ghost", href: "/app/roadmap"},
                            {title: "Profile", icon: User, variant: "ghost", href: "/app/profile"},
                            {title: "Marketplace", label: "9", icon: Store, variant: "ghost", href: "/app/marketplace"},
                            {title: "Settings", icon: Cog, variant: "ghost", href: "/app/settings"},
                        ]}
                    />
                </ResizablePanel>

                 {/*Resizable Handle between panels */}
                 <ResizableHandle withHandle/>

                {/* Main Content Panel */}
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
