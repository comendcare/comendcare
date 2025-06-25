"use client"

import * as React from "react"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@comend/components/ui/resizable"
import { Separator } from "@comend/components/ui/separator"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@comend/components/ui/tabs"
import { TooltipProvider } from "@comend/components/ui/tooltip"
import Browse from "~web/components/browse"
import { useNavStore } from "@/state/nav/navStore"

export function Marketplace() {
    const { setLayout } = useNavStore()

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes) // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full items-stretch"
            >
                <ResizablePanel defaultSize={80} minSize={30}>
                    <Browse />
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}
