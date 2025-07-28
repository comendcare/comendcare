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
