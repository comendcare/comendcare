import NoOrganization from "~web/components/no-organization";
import { getSession } from "@/packages/lib/auth";
import PAGProfilePage from "~web/components/profile-page"
import { getBiosamples, getDatasamples, getDiseaseModels } from "@/packages/lib/fetchers";
import { biosampleSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations";
import { getValidFilters } from "@/packages/lib/data-table";
import { SearchParams } from "@/packages/components/types"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function ProfilePage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);

    const {data: biosamples, pageCount: biosamplesPageCount} = await getBiosamples(
        session?.user.organizationId,
        {...search, filters: validFilters}
    )

    const {data: diseaseModels, pageCount: diseaseModelsPageCount} = await getDiseaseModels(
        session?.user.organizationId,
        {...search, filters: validFilters}
    )

    const {data: clinicalDatasets, pageCount: clinicalDatasetsPageCount} = await getDatasamples(
        session?.user.organizationId,
        {...search, filters: validFilters}
    )

    if (!orgId) return <NoOrganization />
    return <PAGProfilePage />
}
