import React from "react"
import Image from "next/image"
import { getSession } from "~web/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { PrivateDatasampleToolsPage } from "~web/components/private-datasample-tools-page"
import { NewToolDialog } from "~web/components/edit-tool-dialog"
import { getDatasamples } from "@/packages/lib/fetchers"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function DataToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);

    const {data, pageCount} = await getDatasamples(
        session?.user.organizationId,
        {...search, filters: validFilters}
    )

    // not part of an org
    if (!orgId) return <NoOrganization />

    // this org has no data tools (i.e. filters are empty and there is still no data)
    if (data.length === 0 && Object.keys(searchParams).length === 0) {
        return (
            <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any Data Tools</h1>
                    <Image
                        alt="No Data Tools"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                    <p className="text-lg text-stone-500">
                        A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                    </p>
                    <NewToolDialog numAssetsPinned={0} type={"data"}/>
                </div>
            </div>
        )
    }
    return <PrivateDatasampleToolsPage data={data} pageCount={pageCount} />
}
