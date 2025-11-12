import React from "react"
import Image from "next/image"
import {getSession} from "@/packages/lib/auth"
import {SearchParams} from "@/packages/components/types"
import {getValidFilters} from "@/packages/lib/data-table"
import PublicBiosampleToolsPage from "~researcher/components/public-biosamples-tools-page"
import { getAllBiosamples, getBiosamples } from "@/packages/lib/fetchers"
import { biosampleSearchParamsCache } from "@/packages/lib/validations"
import { BiosampleMarketplacePage } from "~researcher/components/marketplace/biosample-tools-page"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    // const session = await getSession()
    // const searchParams = await props.searchParams;
    // const search = biosampleSearchParamsCache.parse(searchParams);
    // const validFilters = getValidFilters(search.filters);

    // const {data, pageCount} = await getAllBiosamples(
    //     session?.user.id,
    //     {...search, filters: validFilters}
    // )

    // // If there are somehow now biosamples returned, show a message
    // if (data?.length === 0) {
    //     return (
    //         <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
    //             <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
    //                 <h1 className="font-cal text-4xl">
    //                     {`We don't have any Biosample Tools right now`}
    //                 </h1>
    //                 <Image
    //                     alt="No Biosample Tools"
    //                     src="https://illustrations.popsy.co/gray/graphic-design.svg"
    //                     width={300}
    //                     height={300}
    //                 />
    //                 <p className="text-lg text-stone-500">
    //                     A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease
    //                     models, papers.
    //                 </p>
    //             </div>
    //         </div>
    //     )
    // }

    // return <PublicBiosampleToolsPage data={data} pageCount={pageCount}/>
        const searchParams = await props.searchParams;
        const search = biosampleSearchParamsCache.parse(searchParams);
        const validFilters = getValidFilters(search.filters);
        const globalFilter = search.q ?? "";
    
        const {data, pageCount} = await getBiosamples(
            undefined,
            {
                id: true,
                createdAt: true,
                updatedAt: true,
                description: true,
                contacts: true,
                attachments: true,
                private: true,
                types: true,
                genotype: true,
                variant: true,
                availability: true,
                quantity: true,
                quantityUnit: true,
                currentCountry: true,
                countryOfCollection: true,
                preservationMethod: true,
                anatomicalSite: true,
                methodOfTransport: true,
                collectionDate: true,
                ageAtCollection: true,
                price: true,
                priceUnit: true,
                notes: true,
    
                milestones: {include: {milestone: true}},
                donorId: true,
                donor: {
                    include: {diagnoses: {include: {type: true}}}
                },
                institutionId: true,
                institution: true,
                company: true,
                geneId: true,
                gene: true,
                genes: true,
                organizationId: true,
                organization: {include: {conditions: {include: {condition: true}}}},
                materialAndDataAccessRequests: true
            },
            {...search, q: globalFilter, filters: validFilters},
            true // public only
        )
    
        // not part of an org
        return <BiosampleMarketplacePage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
