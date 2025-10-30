/* eslint-disable no-console */
import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';

// Prefer the project’s prisma wrapper (handles extensions/encryption).
// If you don't have @comend/lib/prisma, uncomment the fallback below.
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import prisma from '@comend/lib/prisma';

/** ======== Helpers ======== */

function toYesNo(v?: boolean | null): string {
    return v ? 'Yes' : 'No';
}

function toISO(v?: Date | null): string {
    return v ? v.toISOString() : '';
}

function joinArr(v?: string[] | null): string {
    return Array.isArray(v) ? v.join('; ') : '';
}

function safeStr(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    try {
        return JSON.stringify(v);
    } catch {
        return String(v);
    }
}

/** Minimal CSV encoder (no external deps) */
function toCSV(rows: Record<string, string>[], headers: string[]): string {
    const esc = (s: string) =>
        `"${(s ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ') }"`;
    const head = headers.map(esc).join(',');
    const lines = rows.map((r) => headers.map((h) => esc(r[h] ?? '')).join(','));
    return [head, ...lines].join('\n');
}

async function ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
}

/** ======== Exporters ======== */

async function exportOrganizations(outDir: string) {
    // Pull organizations with useful counts for readability
    const orgs = await prisma.organization.findMany({
        include: {
            _count: {
                select: {
                    members: true,
                    roadmaps: true,
                    reviews: true,
                    tools: true,
                    biosamples: true,
                    donors: true,
                    rfps: true,
                    diseaseModel: true,
                },
            },
            user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const headers = [
        'id',
        'public',
        'verified',
        'published',
        'name',
        'description',
        'contactEmail',
        'website',
        'customDomain',
        'subdomain',
        'yearFounded',
        'incorporationStatus',
        'goal',
        'therapeuticsOfInterest',
        'therapeuticsInDevelopment',
        'moneyRaised',
        'moneyDeployed',
        'researchBudget',
        'address1',
        'address2',
        'formattedAddress',
        'city',
        'region',
        'postalCode',
        'country',
        'lat',
        'lng',
        'createdAt',
        'updatedAt',
        'ownerUserId',
        'ownerUserName',
        'ownerUserEmail',
        // Relation counts for readability
        'membersCount',
        'roadmapsCount',
        'reviewsCount',
        'toolsCount',
        'biosamplesCount',
        'donorsCount',
        'rfpsCount',
        'diseaseModelsCount',
    ];

    const rows = orgs.map((o) => ({
        id: o.id,
        public: toYesNo(o.public),
        verified: toYesNo(o.verified),
        published: toYesNo(o.published),
        name: o.name ?? '',
        description: o.description ?? '',
        contactEmail: o.contactEmail ?? '',
        website: o.website ?? '',
        customDomain: o.customDomain ?? '',
        subdomain: o.subdomain ?? '',
        yearFounded: o.yearFounded ?? '',
        incorporationStatus: o.incorporationStatus ?? '',
        goal: o.statedGoal ?? '',
        therapeuticsOfInterest: joinArr(o.therapeuticsOfInterest),
        therapeuticsInDevelopment: joinArr(o.therapeuticsInDevelopment),
        moneyRaised: o.moneyRaised?.toString() ?? '',
        moneyDeployed: o.moneyDeployed?.toString() ?? '',
        researchBudget: o.researchBudget?.toString() ?? '',
        address1: o.address1 ?? '',
        address2: o.address2 ?? '',
        formattedAddress: o.formattedAddress ?? '',
        city: o.city ?? '',
        region: o.region ?? '',
        postalCode: o.postalCode ?? '',
        country: o.country ?? '',
        lat: o.lat ?? '',
        lng: o.lng ?? '',
        createdAt: toISO(o.createdAt),
        updatedAt: toISO(o.updatedAt),
        ownerUserId: o.userId ?? '',
        ownerUserName: o.user?.name ?? '',
        ownerUserEmail: o.user?.email ?? '',
        membersCount: String(o._count.members ?? 0),
        roadmapsCount: String(o._count.roadmaps ?? 0),
        reviewsCount: String(o._count.reviews ?? 0),
        toolsCount: String(o._count.tools ?? 0),
        biosamplesCount: String(o._count.biosamples ?? 0),
        donorsCount: String(o._count.donors ?? 0),
        rfpsCount: String(o._count.rfps ?? 0),
        diseaseModelsCount: String(o._count.diseaseModel ?? 0),
    }));

    const csv = toCSV(rows, headers);
    await fs.writeFile(path.join(outDir, 'organizations.csv'), csv, 'utf8');
}

async function exportRoadmaps(outDir: string) {
    const maps = await prisma.roadmap.findMany({
        include: {
            _count: { select: { edges: true, milestones: true, nodes: true } },
            organization: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const headers = [
        'id',
        'title',
        'description',
        'slug',
        'published',
        'modalities',
        'image',
        'createdAt',
        'updatedAt',
        'organizationId',
        'organizationName',
        'ownerUserId',
        'ownerUserName',
        'ownerUserEmail',
        // relation counts
        'milestonesCount',
        'nodesCount',
        'edgesCount',
    ];

    const rows = maps.map((r) => ({
        id: r.id,
        title: r.title ?? '',
        description: r.description ?? '',
        slug: r.slug ?? '',
        published: toYesNo(r.published),
        modalities: joinArr(r.modalities),
        image: r.image ?? '',
        createdAt: toISO(r.createdAt),
        updatedAt: toISO(r.updatedAt),
        organizationId: r.organizationId ?? '',
        organizationName: r.organization?.name ?? '',
        ownerUserId: r.userId ?? '',
        ownerUserName: r.user?.name ?? '',
        ownerUserEmail: r.user?.email ?? '',
        milestonesCount: String(r._count.milestones ?? 0),
        nodesCount: String(r._count.nodes ?? 0),
        edgesCount: String(r._count.edges ?? 0),
    }));

    const csv = toCSV(rows, headers);
    await fs.writeFile(path.join(outDir, 'roadmaps.csv'), csv, 'utf8');
}

async function exportMilestones(outDir: string) {
    const milestones = await prisma.milestone.findMany({
        include: {
            _count: {
                select: {
                    tasks: true,
                    tools: true,
                    biosamples: true,
                    diseaseModels: true,
                    rfps: true,
                    reviews: true,
                    attachments: true,
                    contacts: true,
                    types: true,
                },
            },
            organization: { select: { id: true, name: true } },
            roadmap: { select: { id: true, title: true } },
            node: { select: { id: true } },
            types: { include: { milestoneType: { select: { id: true, label: true } } } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const headers = [
        'id',
        'title',
        'description',
        'notes',
        'status',
        'budget',
        'startDate',
        'endDate',
        'private',
        'nodeType',
        'timelineOrder',
        'otherTypeDetails',
        'openTo',
        'typeIds',
        'typeLabels',
        'organizationId',
        'organizationName',
        'roadmapId',
        'roadmapTitle',
        'nodeId',
        'createdAt',
        'updatedAt',
        // relation counts
        'tasksCount',
        'toolsCount',
        'biosamplesCount',
        'diseaseModelsCount',
        'rfpsCount',
        'reviewsCount',
        'attachmentsCount',
        'contactsCount',
    ];

    const rows = milestones.map((m) => {
        const typeIds = m.types?.map(t => t.milestoneTypeId) ?? [];
        const typeLabels = m.types?.map(t => t.milestoneType?.label ?? '').filter(Boolean) ?? [];
        return {
            id: m.id,
            title: m.title ?? '',
            description: m.description ?? '',
            notes: m.notes ?? '',
            status: m.status ?? '',
            budget: m.budget != null ? String(m.budget) : '',
            startDate: toISO(m.startDate),
            endDate: toISO(m.endDate),
            private: toYesNo(m.private),
            nodeType: m.nodeType ?? '',
            timelineOrder: String(m.timelineOrder ?? 0),
            otherTypeDetails: m.otherTypeDetails ?? '',
            openTo: joinArr(m.openTo),
            typeIds: joinArr(typeIds),
            typeLabels: joinArr(typeLabels),
            organizationId: m.organizationId ?? '',
            organizationName: m.organization?.name ?? '',
            roadmapId: m.roadmapId ?? '',
            roadmapTitle: m.roadmap?.title ?? '',
            nodeId: m.nodeId ?? m.node?.id ?? '',
            createdAt: toISO(m.createdAt),
            updatedAt: toISO(m.updatedAt),
            // counts
            tasksCount: String(m._count.tasks ?? 0),
            toolsCount: String(m._count.tools ?? 0),
            biosamplesCount: String(m._count.biosamples ?? 0),
            diseaseModelsCount: String(m._count.diseaseModels ?? 0),
            rfpsCount: String(m._count.rfps ?? 0),
            reviewsCount: String(m._count.reviews ?? 0),
            attachmentsCount: String(m._count.attachments ?? 0),
            contactsCount: String(m._count.contacts ?? 0),
        };
    });

    const csv = toCSV(rows, headers);
    await fs.writeFile(path.join(outDir, 'milestones.csv'), csv, 'utf8');
}

async function exportServices(outDir: string) {
    const services = await prisma.service.findMany({
        include: {
            _count: {
                select: {
                    company: true,
                    companyContactRequestToService: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    const headers = [
        'id',
        'name',
        'description',
        'metadata',
        // relation counts
        'companiesCount',
        'contactRequestsCount',
    ];

    const rows = services.map((s) => ({
        id: s.id,
        name: s.name ?? '',
        description: s.description ?? '',
        metadata: safeStr(s.metadata),
        companiesCount: String(s._count.company ?? 0),
        contactRequestsCount: String(s._count.companyContactRequestToService ?? 0),
    }));

    const csv = toCSV(rows, headers);
    await fs.writeFile(path.join(outDir, 'services.csv'), csv, 'utf8');
}

async function exportCompanies(outDir: string) {
    const companies = await prisma.company.findMany({
        include: {
            _count: {
                select: {
                    sites: true,
                    services: true,
                    certifications: true,
                    rfis: true,
                    reviews: true,
                    savedByOrganizations: true,
                    contactRequestedByOrganizations: true,
                    biosamples: true,
                    diseaseModel: true,
                    tool: true,
                },
            },
            services: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const headers = [
        'id',
        'url',
        'scientistDotComURL',
        'title',
        'description',
        'yearEstablished',
        'website',
        'headquarters',
        'companyType',
        'simplifiedCertifications',
        'tags',
        'avgRating',
        'categories',
        'milestoneTypes',
        'metadata',
        'createdAt',
        'updatedAt',
        // service list (helpful in CSVs)
        'serviceIds',
        'serviceNames',
        // relation counts
        'sitesCount',
        'servicesCount',
        'certificationsCount',
        'rfisCount',
        'reviewsCount',
        'savedByOrgsCount',
        'contactRequestsByOrgsCount',
        'biosamplesCount',
        'diseaseModelsCount',
        'toolsCount',
    ];

    const rows = companies.map((c) => {
        const svcIds = c.services?.map((s) => s.id) ?? [];
        const svcNames = c.services?.map((s) => s.name ?? '').filter(Boolean) ?? [];

        return {
            id: c.id,
            url: c.url ?? '',
            scientistDotComURL: c.scientistDotComURL ?? '',
            title: c.title ?? '',
            description: c.description ?? '',
            yearEstablished: c.yearEstablished != null ? String(c.yearEstablished) : '',
            website: c.website ?? '',
            headquarters: c.headquarters ?? '',
            companyType: c.companyType ?? '',
            simplifiedCertifications: joinArr(c.simplifiedCertifications),
            tags: joinArr(c.tags),
            avgRating: c.avgRating != null ? String(c.avgRating) : '',
            categories: joinArr(c.categories),
            milestoneTypes: joinArr(c.milestoneTypes),
            metadata: safeStr(c.metadata),
            createdAt: toISO(c.createdAt),
            updatedAt: toISO(c.updatedAt),

            serviceIds: joinArr(svcIds),
            serviceNames: joinArr(svcNames),

            sitesCount: String(c._count.sites ?? 0),
            servicesCount: String(c._count.services ?? 0),
            certificationsCount: String(c._count.certifications ?? 0),
            rfisCount: String(c._count.rfis ?? 0),
            reviewsCount: String(c._count.reviews ?? 0),
            savedByOrgsCount: String(c._count.savedByOrganizations ?? 0),
            contactRequestsByOrgsCount: String(c._count.contactRequestedByOrganizations ?? 0),
            biosamplesCount: String(c._count.biosamples ?? 0),
            diseaseModelsCount: String(c._count.diseaseModel ?? 0),
            toolsCount: String(c._count.tool ?? 0),
        };
    });

    const csv = toCSV(rows, headers);
    await fs.writeFile(path.join(outDir, 'companies.csv'), csv, 'utf8');
}

/** ======== Main ======== */

async function main() {
    const outDir = path.resolve(process.cwd(), 'exports');
    await ensureDir(outDir);

    console.log('Exporting Organizations...');
    await exportOrganizations(outDir);
    console.log('Exporting Roadmaps...');
    await exportRoadmaps(outDir);
    console.log('Exporting Milestones...');
    await exportMilestones(outDir);
    console.log('Exporting Services...');
    await exportServices(outDir);
    console.log('Exporting Companies...');
    await exportCompanies(outDir);

    console.log('Done. Files written to ./exports');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // @ts-ignore if using the wrapper, this still works; otherwise remove.
        await prisma.$disconnect?.();
    });
