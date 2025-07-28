export function mergeResearcherData(dbResearcher: any, openAlex: any, publications: any[] = []) {
    const email = dbResearcher.email ?? openAlex?.email ?? null;
    const display_name = dbResearcher.name ?? openAlex?.display_name ?? "Unknown Researcher";

    return {
        researcher: dbResearcher,
        openAlex: {
            ...openAlex,
            display_name,
            last_known_institutions: openAlex?.last_known_institutions ?? [],
            summary_stats: openAlex?.summary_stats ?? {},
            works_count: openAlex?.works_count ?? 0,
            cited_by_count: openAlex?.cited_by_count ?? 0,
            affiliations: openAlex?.affiliations ?? [],
            topics: openAlex?.topics ?? [],
        },
        publications,
        mergedFields: {
            name: dbResearcher.name ?? openAlex?.display_name,
            title: dbResearcher.title ?? null,
            email,
            researchInterests: dbResearcher.researchInterests?.length ? dbResearcher.researchInterests : (openAlex?.topics?.map((t: any) => t.display_name) ?? []),
        }
    };
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case "APPROVED":
            return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
        case "IN-PROGRESS":
            return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
        case "REJECTED":
            return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
        case "COMPLETED":
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
    }
}

export const getStatusText = (status: string) => {
    switch (status) {
        case "APPROVED":
            return "Approved"
        case "PENDING":
            return "Under Review"
        case "IN-PROGRESS":
            return "In Progress"
        case "REJECTED":
            return "Rejected"
        case "COMPLETED":
            return "Completed"
        default:
            return status
    }
}
