import React from "react";
import CROPageTabs from "~provider/components/cro-page-tabs";
import CROPageHeader from "~provider/components/cro-page-header";

export default function CompanyHomePage({
                                                  params
                                              }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)

    return (
            <div
                className="flex flex-col w-full max-w-7xl mx-auto p-8 gap-4"
            >
                <main className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
                    <CROPageHeader id={id}/>
                    <CROPageTabs/>
                </main>
            </div>
    )
}
