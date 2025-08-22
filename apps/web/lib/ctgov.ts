const CTG_BASE = "https://beta-ut.clinicaltrials.gov/api/v2";

export type CtgovStudy = {
    protocolSection?: {
        identificationModule?: {
            nctId?: string;
            briefTitle?: string;
        };
        statusModule?: {
            overallStatus?: string;
            studyFirstPostDateStruct?: { date?: string; type?: string };
            lastUpdatePostDateStruct?: { date?: string; type?: string };
        };
        conditionsModule?: { conditions?: string[] };
        contactsLocationsModule?: {
            locations?: Array<{
                facility?: string;
                city?: { name?: string };
                state?: { name?: string };
                country?: string;
            }>;
        };
    };
};

export type CtgovPage = {
    nextPageToken?: string;
    studies?: CtgovStudy[];
    totalCount?: number;
};

export async function fetchCtgovPage(params: URLSearchParams): Promise<CtgovPage> {
    const url = `${CTG_BASE}/studies?${params.toString()}`;
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
    });
    if (!res.ok) {
        let body: any;
        try { body = await res.text(); } catch {}
        throw new Error(`CT.gov fetch failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
    }
    return res.json();
}

/** Shape into the exact payload your mapper expects */
export function shapeForMapper(s: CtgovStudy) {
    const id = s.protocolSection?.identificationModule?.nctId;
    const title = s.protocolSection?.identificationModule?.briefTitle;

    const status = s.protocolSection?.statusModule?.overallStatus;
    const posted = s.protocolSection?.statusModule?.studyFirstPostDateStruct?.date;

    const conditions = s.protocolSection?.conditionsModule?.conditions ?? [];

    const locsRaw = s.protocolSection?.contactsLocationsModule?.locations ?? [];
    const locations = locsRaw.map(loc => {
        const parts = [
            loc.facility,
            loc.city?.name,
            loc.state?.name,
            loc.country,
        ].filter(Boolean);
        return parts.join(", ");
    });

    return {
        NCTId: id,
        BriefTitle: title,
        CurrentRecruitmentStatus: status,
        Conditions: conditions,
        Locations: locations,
        postedDate: posted, // not used by mapper, but handy for occurredAt
    };
}
