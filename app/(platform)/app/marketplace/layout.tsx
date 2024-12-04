"use client"
// import {Metadata} from "next"
import {MarketplaceNav} from "@/components/marketplace-nav"
import { MilestoneFilters } from "@/components/milestone-filters"
import { PAGFilters } from "@/components/pag-filters"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useFiltersStore } from "@/state/nav/navStore"
import { usePathname } from "next/navigation"

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function ProjectLayout({children}: ProjectLayoutProps) {
    // Zustand state management
    const { defaultLayout, setLayout } = useFiltersStore()

    return (
        <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
                setLayout(sizes) // Use Zustand's setLayout to save panel sizes
            }}
            className="h-full items-stretch"
        >
                <ResizablePanel defaultSize={defaultLayout[0]} minSize={30} className="container relative flex flex-col items-center">
                    <MarketplaceNav projectId=""/>
                    {children}
                </ResizablePanel>

                <>
                    <ResizableHandle withHandle />

                    <ResizablePanel
                        defaultSize={defaultLayout[1]}
                        minSize={10}
                        className="p-8 flex flex-col gap-4"
                    >
                        <FiltersPanel />
                    </ResizablePanel>
                </>
        </ResizablePanelGroup>
    )
}

const FiltersPanel = () => {
    const pathname = usePathname()

    if (pathname.endsWith('/milestones')) {
        return <MilestoneFilters />
    } else {
        return <PAGFilters />
    }
}
