import { AdminToolsNav } from "@/components/admin-tools-nav";
import PlaceholderCard from "@/components/placeholder-card";
import { ReactNode, Suspense } from "react";

export default function ToolsAnalyticsLayout({children}: {children: ReactNode}) {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <AdminToolsNav />
            <div className="flex flex-col space-y-6">
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({length: 8}).map((_, i) => (
                                <PlaceholderCard key={i}/>
                            ))}
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </div>
        </div>
    );
}