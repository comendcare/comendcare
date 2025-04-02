import Link from "next/link";
import React from "react";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft, Store } from "lucide-react";
import CROPageTabs from "@/components/cro-page-tabs";
import CROPageHeader from "@/components/cro-page-header";

export default function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)

    return (
        <TooltipProvider>
            <div
                className="flex flex-col w-full max-w-7xl mx-auto p-8 gap-4"
            >
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/cro`
                            : `http://localhost:3000/app/marketplace/cro`
                    }
                    className="inline-flex items-center gap-x-2 hover:underline"
                >
                    <ArrowLeft />
                    <Store className="h-4 w-4"/>
                    Return to marketplace
                </Link>
                <main className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
                    <CROPageHeader id={id}/>
                    <CROPageTabs/>
                </main>
            </div>
        </TooltipProvider>
    )
}
