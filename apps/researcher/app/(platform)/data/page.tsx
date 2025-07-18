import React from "react"
import Image from "next/image"
import {getSession} from "@comend/lib/auth"
import {SearchParams} from "@/packages/components/types"
import {biosampleSearchParamsCache} from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import {getValidFilters} from "@/packages/lib/data-table"
import PublicBiosampleToolsPage from "~researcher/components/public-biosamples-tools-page"
import {getAllBiosamples} from "~researcher/lib/fetchers";

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);

    const {data, pageCount} = await getAllBiosamples(
        session?.user.id,
        {...search, filters: validFilters}
    )
    console.log("flawnson", data[4])

    // this org has no biosample tools (i.e. filters are empty and there is still no data)
    if (data.length === 0 && Object.keys(searchParams).length === 0) {
        return (
            <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any Biosample Tools</h1>
                    <Image
                        alt="No Biosample Tools"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                    <p className="text-lg text-stone-500">
                        A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease
                        models, papers.
                    </p>
                </div>
            </div>
        )
    }

    return <PublicBiosampleToolsPage data={data} pageCount={pageCount}/>
}
