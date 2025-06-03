"use client"
import {MarketplaceNav} from "@/components/marketplace-nav"
import {MilestoneFilters} from "@/components/milestone-filters"
import {PAGFilters} from "@/components/pag-filters"
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable"
import {useFiltersStore} from "@/state/nav/navStore"
import {usePathname} from "next/navigation"
import {useEffect, useState} from "react";
import {Organization} from "@prisma/client";
import {getOrganizationFromOrganizationId, getPublicOrganizationData} from "@/lib/fetchers";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import Image from "next/image"
import {CROFilters} from "@/components/cro-filters";

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function ProjectLayout({children}: ProjectLayoutProps) {
    // Zustand state management
    const {data: session} = useSession()
    const {defaultLayout, setLayout} = useFiltersStore()
    const [organization, setOrganization] = useState<Organization | null>();

    useEffect(() => {
        session?.user?.organizationId ? getPublicOrganizationData(session.user?.organizationId).then((response) => {
            if (response.success) {
                const organization = response.data
                setOrganization(organization)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }) : toast.error("No organizationId provided")
    }, [session?.user?.organizationId, setOrganization]);

    if (organization && !organization?.published) {
        return <div className="h-full flex flex-col mx-auto items-center justify-center py-20">
            <Image
                alt="Organization not published"
                src="https://illustrations.popsy.co/gray/meditation-girl.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            <Image
                alt="Organization not published"
                src="https://illustrations.popsy.co/white/meditation-girl.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <p className="text-center font-title text-2xl text-stone-600 dark:text-stone-400">
                {`Your organization isn't published yet.`}
            </p>
            <p className="text-center mt-4 text-stone-500 dark:text-stone-300 max-w-xl">
                {`To access the marketplace you need to publish your organization. Only published organizations can view and be shown in the marketplace.`}
            </p>
        </div>
    }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
                setLayout(sizes) // Use Zustand's setLayout to save panel sizes
            }}
            className="h-full items-stretch"
        >
            <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}
                            className="container relative flex flex-col items-center">
                <MarketplaceNav projectId=""/>
                {children}
            </ResizablePanel>

            <>
                <ResizableHandle withHandle/>

                <ResizablePanel
                    defaultSize={defaultLayout[1]}
                    minSize={15}
                    maxSize={30}
                    className="bg-white p-8 flex flex-col gap-4"
                >
                    <FiltersPanel/>
                </ResizablePanel>
            </>
        </ResizablePanelGroup>
    )
}

const FiltersPanel = () => {
    const pathname = usePathname()

    if (pathname.endsWith('/milestones')) {
        return <MilestoneFilters/>
    } else if (pathname.endsWith('/service-providers')){
        return <CROFilters/>
    } else {
        return <PAGFilters/>
    }
}
