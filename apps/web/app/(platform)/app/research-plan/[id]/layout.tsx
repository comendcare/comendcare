import {ensureOrgContextForRoadmap} from "@comend/lib/fetchers"

interface ResearchPlanLayoutProps {
    children: React.ReactNode
    params: { id: string }
}

export const revalidate = 30; // Revalidate every 30 seconds

export default async function ResearchPlanLayout({children, params}: ResearchPlanLayoutProps) {
    await ensureOrgContextForRoadmap(params.id);

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            {children}
        </main>
    )
}
