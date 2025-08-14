"use server";

import {getSession} from "@/packages/lib/auth"
import prisma from "@comend/lib/prisma";

const orgDeepInclude = {
    members: { include: { user: true } },
    invitations: true,
    membershipRequests: { include: { user: true } },
    clients: true,
    platformNotifications: true,
    reviews: {
        include: {
            author: true,
            company: true,
            replies: { include: { author: true } },
            feedbacks: { include: { user: true } },
            milestones: { include: { milestone: true } },
            reports: { include: { user: true } },
        },
    },
    savedCompanies: {
        include: {
            company: {
                include: {
                    sites: true,
                    services: true,
                    certifications: { include: { files: true } },
                    rfis: true,
                    reviews: true,
                },
            },
            milestone: true,
        },
    },
    contactRequestedCompanies: {
        include: {
            company: true,
            services: { include: { service: true } },
            rfps: { include: { rfp: true } },
        },
    },
    savedOrganizations: { include: { savedOrganization: true } },
    savedByOrganizations: { include: { organization: true } },

    roadmaps: {
        include: {
            user: true,
            nodes: true,
            edges: true,
            milestones: {
                include: {
                    tools: { include: { tool: true } },
                    biosamples: { include: { biosample: true } },
                    diseaseModels: { include: { diseaseModel: true } },
                    rfps: { include: { rfp: true } },
                    types: { include: { milestoneType: true } },
                    reviews: { include: { review: true } },
                    savedCompanies: true,
                    attachments: true,
                    contacts: true,
                },
            },
        },
    },

    milestones: {
        include: {
            tools: { include: { tool: true } },
            biosamples: { include: { biosample: true } },
            diseaseModels: { include: { diseaseModel: true } },
            rfps: { include: { rfp: true } },
            types: { include: { milestoneType: true } },
            reviews: { include: { review: true } },
            savedCompanies: true,
            attachments: true,
            contacts: true,
            roadmap: true,
        },
    },

    kanban: {
        include: {
            columns: {
                include: {
                    tasks: {
                        include: {
                            checklist: true,
                            stakeholders: { include: { user: true } },
                            milestone: true,
                        },
                    },
                },
            },
        },
    },

    tools: {
        include: {
            contacts: true,
            attachments: true,
            milestones: { include: { milestone: true } },
            institution: true,
            gene: true,
        },
    },
    biosamples: {
        include: {
            contacts: true,
            attachments: true,
            milestones: { include: { milestone: true } },
            institution: true,
            donor: {
                include: {
                    diagnoses: { include: { type: true } },
                },
            },
            gene: true,
        },
    },
    donors: {
        include: {
            biosamples: true,
            diagnoses: { include: { type: true } },
        },
    },
    DiseaseModel: {
        include: {
            contacts: true,
            attachments: true,
            milestones: { include: { milestone: true } },
            institution: true,
            gene: true,
            condition: true,
        },
    },

    rfps: {
        include: {
            contacts: true,
            attachments: true,
            milestones: { include: { milestone: true } },
            companyContactRequestToRFP: true,
        },
    },

    conditions: { include: { condition: true } },

    materialAndDataAccessRequests: {
        include: {
            researcher: {
                include: {
                    user: true,
                    affiliations: { include: { institution: true } },
                },
            },
            institutions: { include: { institution: true } },
            comments: { include: { author: true } },
        },
    },

    user: true,
};

async function assertOwner(orgId: string) {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const membership = await prisma.member.findFirst({
        where: { userId: session.user.id, organizationId: orgId },
        select: { role: true },
    });
    if (!membership || membership.role !== "owner") throw new Error("Forbidden");
}

export async function exportOrganizationAsJSON(orgId: string) {
    await assertOwner(orgId);

    const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        include: orgDeepInclude,
    });

    if (!organization) throw new Error("Not found");

    // Keep it simple: return an object the client can stringify & download
    return {
        exportedAt: new Date().toISOString(),
        version: 1,
        organization,
    };
}

/**
 * Tiny CSV util with safe header union + value escaping.
 */
function toCSV(rows: Array<Record<string, any>>): string {
    if (!rows.length) return "";
    // Collect header keys across all rows (stable order)
    const headerSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
    const headers = Array.from(headerSet);

    const escape = (val: any) => {
        if (val === null || val === undefined) return "";
        const s =
            typeof val === "string"
                ? val
                : typeof val === "number" || typeof val === "boolean"
                    ? String(val)
                    : JSON.stringify(val); // fallback for arrays/objects
        // If contains comma, quote, or newline — wrap & escape quotes
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };

    const lines = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ];
    return lines.join("\n");
}

/**
 * Helpers to flatten minimal fields we care about for each entity.
 * Keep these flat for spreadsheet friendliness; keep relations by id fields.
 */
const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) => {
    const out: any = {};
    keys.forEach((k) => (out[k as string] = (obj as any)?.[k]));
    return out;
};

export async function exportOrganizationAsCSV(orgId: string) {
    await assertOwner(orgId);

    // Pull a lean but useful slice of the graph for CSVs
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
            user: true,
            members: { include: { user: true } },
            invitations: true,
            membershipRequests: { include: { user: true } },
            roadmaps: {
                include: {
                    user: true,
                    nodes: true,
                    edges: true,
                    milestones: {
                        include: {
                            types: { include: { milestoneType: true } },
                        },
                    },
                },
            },
            milestones: {
                include: {
                    roadmap: true,
                },
            },
            tools: true,
            biosamples: true,
            rfps: true,
        },
    });

    if (!org) throw new Error("Not found");

    // Build rows per file
    const organizationRows = [
        {
            ...pick(org, [
                "id",
                "name",
                "slug",
                "createdAt",
                "updatedAt",
                "type",
                "website",
                "description",
            ] as any),
            ownerUserId: org.userId ?? null,
            memberCount: org.members.length,
            roadmapCount: org.roadmaps.length,
            milestoneCount: org.milestones.length,
            toolCount: org.tools.length,
            biosampleCount: org.biosamples.length,
            rfpCount: org.rfps.length,
        },
    ];

    const memberRows = org.members.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        userId: m.userId,
        userEmail: m.user?.email ?? null,
        role: m.role,
        createdAt: m.createdAt,
    }));

    const invitationRows = org.invitations.map((i) => ({
        id: i.id,
        organizationId: i.organizationId,
        email: i.email,
        role: i.role,
        createdAt: i.createdAt,
    }));

    const membershipRequestRows = org.membershipRequests.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        userId: r.userId,
        userEmail: r.user?.email ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    }));

    const roadmapRows = org.roadmaps.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        title: r.title,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        ownerUserId: r.userId,
        nodeCount: r.nodes.length,
        edgeCount: r.edges.length,
        milestoneCount: r.milestones.length,
    }));

    const roadmapNodeRows = org.roadmaps.flatMap((r) =>
        r.nodes.map((n) => ({
            id: n.id,
            roadmapId: r.id,
            x: (n as any).x ?? null,
            y: (n as any).y ?? null,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
        }))
    );

    const roadmapEdgeRows = org.roadmaps.flatMap((r) =>
        r.edges.map((e) => ({
            id: e.id,
            roadmapId: r.id,
            sourceId: (e as any).sourceId ?? e.source,
            targetId: (e as any).targetId ?? e.target,
            label: (e as any).label ?? null,
        }))
    );

    const roadmapMilestoneRows = org.roadmaps.flatMap((r) =>
        r.milestones.map((m) => ({
            id: m.id,
            roadmapId: r.id,
            title: m.title,
            status: m.status,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        }))
    );

    const orgMilestoneRows = org.milestones.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        roadmapId: m.roadmapId,
        title: m.title,
        status: m.status,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
    }));

    const toolRows = org.tools.map((t) => ({
        id: t.id,
        organizationId: t.organizationId,
        description: t.description,
        institutionId: (t as any).institutionId ?? null,
        geneId: (t as any).geneId ?? null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
    }));

    const biosampleRows = org.biosamples.map((b) => ({
        id: b.id,
        organizationId: b.organizationId,
        donorId: (b as any).donorId ?? null,
        institutionId: (b as any).institutionId ?? null,
        geneId: (b as any).geneId ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    }));

    const rfpRows = org.rfps.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        title: r.title,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    }));

    // Build CSV text per logical table
    const files: Record<string, string> = {
        "organization.csv": toCSV(organizationRows),
        "members.csv": toCSV(memberRows),
        "invitations.csv": toCSV(invitationRows),
        "membership_requests.csv": toCSV(membershipRequestRows),
        "roadmaps.csv": toCSV(roadmapRows),
        "roadmap_nodes.csv": toCSV(roadmapNodeRows),
        "roadmap_edges.csv": toCSV(roadmapEdgeRows),
        "roadmap_milestones.csv": toCSV(roadmapMilestoneRows),
        "milestones.csv": toCSV(orgMilestoneRows),
        "tools.csv": toCSV(toolRows),
        "biosamples.csv": toCSV(biosampleRows),
        "rfps.csv": toCSV(rfpRows),
    };

    // Return a simple payload the client can package (download one file or zip them if desired)
    return {
        exportedAt: new Date().toISOString(),
        version: 1,
        organizationId: org.id,
        files, // filename -> CSV text
    };
}
