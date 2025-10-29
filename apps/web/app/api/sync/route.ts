// import { syncToTypesense } from '@comend/lib/sync';
import { NextResponse } from 'next/server';
import prisma from "@comend/lib/prisma"
import { BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, RFP, TOOL_TYPE_OPTIONS } from '@comend/lib/types';
import { checkDateRangeUTC, getSortRank, handleGetAvailability, stringToSortableInt } from '@/packages/lib/utils';

const sendTypeSenseRequest = async (
    url: string,
    method: string,
    apiKey: string,
    data?: any
) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey,
    };
    const body = data ? JSON.stringify(data) : undefined;

    console.log(`Sending TypeSense request: ${method} ${url}`);
    if (data) console.log('Request payload:', JSON.stringify(data, null, 2));

    try {
        const response = await fetch(url, { method, headers, body });
        const responseData = await response.json();
        console.log(`Response from TypeSense (${method} ${url}):`, responseData);
        return responseData;
    } catch (error) {
        console.error(`Error in TypeSense request (${method} ${url}):`, error);
        throw error;
    }
};

const manageCollection = async (
    typesenseUrl: string,
    apiKey: string,
    collectionName: string,
    schema?: any
) => {
    const collectionUrl = `${typesenseUrl}/collections/${collectionName}`;
    try {
        console.log(`Attempting to delete collection: ${collectionName}`);
        await sendTypeSenseRequest(collectionUrl, 'DELETE', apiKey);
        console.log(`Deleted existing collection: ${collectionName}`);
    } catch (err) {
        if (err instanceof Error) {
            console.log(`Collection ${collectionName} does not exist or deletion failed:`, err.message);
        } else {
            console.log(`Collection ${collectionName} does not exist or deletion failed with unknown error:`, err);
        }
    }

    if (schema) {
        console.log(`Creating collection: ${collectionName} with schema:`, JSON.stringify(schema, null, 2));
        await sendTypeSenseRequest(`${typesenseUrl}/collections`, 'POST', apiKey, schema);
        console.log(`Recreated collection: ${collectionName}`);
    }
};

const bulkImportDocuments = async (
    typesenseUrl: string,
    apiKey: string,
    collectionName: string,
    documents: any[]
) => {
    const importUrl = `${typesenseUrl}/collections/${collectionName}/documents/import`;
    const documentsString = documents.map((doc) => JSON.stringify(doc)).join('\n');

    console.log(`Importing ${documents.length} documents to collection: ${collectionName}`);
    console.log('Documents being imported:', documents);

    try {
        const response = await fetch(importUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'X-TYPESENSE-API-KEY': apiKey,
            },
            body: documentsString,
        });
        const result = await response.text();
        console.log(`Bulk import result for ${collectionName}:`, result);
    } catch (error) {
        console.error(`Error during bulk import for ${collectionName}:`, error);
        throw error;
    }
};

const syncToTypesense = async (env: {
    TYPESENSE_ADMIN_API_KEY: string;
    TYPESENSE_URL: string;
}) => {
    console.log('Starting syncToTypesense job...');
    console.log('Environment variables:', env);

    try {

        // Define schemas
        const organizationSchema = {
            name: 'organizations',
            enable_nested_fields: true,
            fields: [
                {
                    name: "id",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "name",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "description",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "yearFounded",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "updatedAt",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "createdAt",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "moneyDeployed",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "moneyRaised",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "firstConditionPatientsEngaged",  // NEEDED FOR SORTING BY PATIENTS ENGAGED IN MARKETPLACE
                    type: "int32",
                    index: true,
                    sort: true,
                    store: true,
                    optional: true,
                },
                {
                    name: "conditions",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "object[]"
                },
                {
                    name: "therapeuticsOfInterest",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string[]"
                },
            ],
        };
        const milestoneSchema = {
            name: 'milestones',
            enable_nested_fields: true,
            fields: [
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "title",
                    optional: false,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "description",
                    optional: false,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "type",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "status",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "updatedAt",
                    optional: false,
                    sort: true,  // Enable sorting
                    stem: false,
                    store: true,
                    type: "int64" // Store timestamps as Unix timestamps (milliseconds)
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "nodeType",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
            ],
        };
        const companySchema = {
            name: 'companies',
            enable_nested_fields: true,
            fields: [
                {
                    name: "id",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "title",
                    type: "string",
                    index: true,
                    sort: true,
                    store: true,
                    optional: true
                },
                {
                    name: "description",
                    type: "string",
                    index: true,
                    store: true,
                    optional: true
                },
                {
                    name: "url",
                    type: "string",
                    index: true,
                    store: true,
                    optional: true
                },
                {
                    name: "yearEstablished",
                    type: "int32",
                    index: true,
                    sort: true,
                    store: true,
                    optional: true
                },
                {
                    name: "website",
                    type: "string",
                    index: true,
                    store: true,
                    optional: true
                },
                {
                    name: "headquarters",
                    type: "string",
                    index: true,
                    store: true,
                    optional: true
                },
                {
                    name: "companyType",
                    type: "string",
                    index: true,
                    store: true,
                    facet: true,
                    optional: true
                },
                {
                    name: "avgRating",
                    type: "float",
                    index: true,
                    sort: true,
                    store: true,
                    optional: true
                },
                {
                    name: "simplifiedCertifications",
                    type: "string[]",
                    index: true,
                    store: true,
                    facet: true,
                    optional: true
                },
                {
                    name: "tags",
                    type: "string[]",
                    index: true,
                    store: true,
                    facet: true,
                    optional: true
                },
                {
                    name: "milestoneTypes",
                    type: "string[]",
                    index: true,
                    store: true,
                    facet: true,
                    optional: true
                },
                {
                    name: "categories",
                    type: "string[]",
                    index: true,
                    store: true,
                    facet: true,
                    optional: true
                }
            ],
        };
        const biosampleSchema = {
            name: 'biosamples',
            enable_nested_fields: true,
            fields: [
                {
                    name: ".*",
                    type: "auto",
                },
                {
                    name: "sortId.id", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "type.label",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "availability.value",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "condition.name",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "organization.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "institution.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "donor.id",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "gene.symbol",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "genotype.genotype", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true,
                },
            ]
        }
        const diseaseModelSchema = {
            name: 'disease-models',
            enable_nested_fields: true,
            fields: [
                {
                    name: ".*",
                    type: "auto",
                },
                {
                    name: "sortId.id", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "gene.symbol",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "condition.name",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "type.label",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "organization.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "institution.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "genotype.genotype", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "strain.strain", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true,
                }
            ]
        }
        const clinicalDatasetSchema = {
            name: 'clinical-datasets',
            enable_nested_fields: true,
            fields: [
                {
                    name: ".*",
                    type: "auto",
                },
                {
                    name: "sortId.id", // hack to allow typesense to sort on the string type
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "title.title",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "gene.symbol",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "condition.name",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "type.label",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "organization.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "institution.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "cohortSize",
                    type: "int64",
                    sort: true,
                    optional: true,
                }
            ]
        }
        const rfpSchema = {
            name: 'rfps',
            enable_nested_fields: true,
            fields: [
                {
                    name: ".*",
                    type: "auto",
                },
                {
                    name: "condition.name",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "organization.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "sort_rank",
                    type: "int64",
                    sort: true,
                    optional: false,
                },
                // {
                //     name: "status",
                //     type: "string",
                //     sort: false,
                //     optional: true
                // }
            ]
        }

        console.log('Organization Schema:', JSON.stringify(organizationSchema, null, 2));
        console.log('Milestone Schema:', JSON.stringify(milestoneSchema, null, 2));
        console.log('CRO Schema:', JSON.stringify(companySchema, null, 2));
        console.log('Biosample Schema:', JSON.stringify(biosampleSchema, null, 2));
        console.log('Disease Model:', JSON.stringify(diseaseModelSchema, null, 2));
        console.log('Clinical Dataset:', JSON.stringify(clinicalDatasetSchema, null, 2));
        console.log(`RFPs`, JSON.stringify(rfpSchema, null, 2));

        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', organizationSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', milestoneSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'companies', companySchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'biosamples', biosampleSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'disease-models', diseaseModelSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'clinical-datasets', clinicalDatasetSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'rfps', rfpSchema);

        const organizations = await prisma.organization.findMany({
            where: {
                verified: true,
                published: true
            }
        });
        const milestones = await prisma.milestone.findMany({
            where: {
                organization: {
                    published: true,
                    verified: true
                }
            }
        });
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                url: true,
                yearEstablished: true,
                website: true,
                headquarters: true,
                companyType: true,
                categories: true,
                avgRating: true,
                simplifiedCertifications: true,
                tags: true,
                milestoneTypes: true,
            }
        });
        const biosamples = await prisma.biosample.findMany({
            where: {
                private: false // only sync public biosamples
            },
            select: {
                createdAt: true,
                // this list must include ALL items that allow sorting in the table
                // otherwise the sorting will not function
                organization: {
                    select: {
                        id: true,
                        name: true,
                        conditions: {
                            select: {
                                condition: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                id: true,
                // only include public donor ID (no other donor information should be uploaded to typesense)
                donor: {select: {id: true}},
                types: true,
                gene: true,
                availability: true,
                quantity: true,
                institution: true,
                company: true,
                description: true,
                genotype: true,
                createFacilityRequests: true,
            }
        })
        const diseaseModels = await prisma.diseaseModel.findMany({
            where: {
                private: false
            },
            select: {
                createdAt: true,
                // this list must include ALL items that allow sorting in the table
                // otherwise the sorting will not function
                organization: {
                    select: {
                        id: true,
                        name: true,
                        conditions: {
                            select: {
                                condition: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                id: true,
                description: true,
                institution: true,
                company: true,
                gene: true,
                types: true,
                genotype: true,
                strain: true,
            }
        })
        const clinicalDatasets = await prisma.tool.findMany({
            where: {
                private: false
            },
            select: {
                createdAt: true,
                // this list must include ALL items that allow sorting in the table
                // otherwise the sorting will not function
                organization: {
                    select: {
                        id: true,
                        name: true,
                        conditions: {
                            select: {
                                condition: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                id: true,
                title: true,
                description: true,
                institution: true,
                company: true,
                gene: true,
                types: true,
                cohortSize: true,
            }
        })
        const rfps = await prisma.rFP.findMany({
            where: {
                private: false // only sync public biosamples
            },
            select: {
                createdAt: true,
                // this list must include ALL items that allow sorting in the table
                // otherwise the sorting will not function
                organization: {
                    select: {
                        id: true,
                        name: true,
                        conditions: {
                            select: {
                                condition: {
                                    select: {
                                        name: true,
                                        causalGenes: true,
                                        associatedGenes: true,
                                    }
                                }
                            }
                        }
                    }
                },
                id: true,
                title: true,
                description: true,
                eligibility: true,
                evaluationProcess: true,
                openTo: true,
                startDate: true,
                endDate: true
            }
        })

        console.log('Raw organizations data:', organizations);
        console.log('Raw milestones data:', milestones);
        console.log('Raw companies data:', companies);
        console.log('Raw biosamples data:', biosamples)
        console.log('Raw disease models data:', diseaseModels)
        console.log('Raw clinical datasets data:', clinicalDatasets)
        console.log('Raw rfp data:', rfps)

        if (organizations.length > 0) {
            console.log('Validating organization data...');

            // map orgs to include all required data
            const uploadOrgs = await Promise.all(organizations.map(async (org, index) => {
                console.log(`Org ${index + 1}:`, org)
                const organization = await prisma.organization.findUnique({
                    where: { id: org.id },
                    include: { 
                        conditions: {include: {condition: true}},
                        roadmaps: true,
                        milestones: true,
                        tools: true,
                        rfps: true
                    }
                })

                if (!organization) return null;

                // Special case made for sortable condition attributes
                // This is temporary until we find a better way to handle the organization condition relationship
                const firstConditionPatientsEngaged = organization.conditions?.[0]?.condition?.numberOfPatientsEngaged ?? 0;

                // combine, org updates, research plan updates, project updates, tool updates, and RFP updates. Then find
                // the most recently updated time (this will be used in the Recently Updates sortBy in the marketplace)
                const orgUpdatedAt = Math.max(...[organization.updatedAt.valueOf()].concat(
                    organization.roadmaps.map(roadmap => roadmap.updatedAt.valueOf()),
                    organization.milestones.map(milestone => milestone.updatedAt.valueOf()),
                    organization.tools.map(tool => tool.updatedAt.valueOf()),
                    organization.rfps.map(rfp => rfp.updatedAt.valueOf())
                ))

                return {
                    ...organization,
                    updatedAt: orgUpdatedAt,
                    createdAt: organization.createdAt.valueOf(),
                    firstConditionPatientsEngaged
                }
            }))

            const validOrganizations = uploadOrgs.filter(Boolean);

            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', validOrganizations);
        } else {
            console.log('No organizations to import.');
        }

        if (milestones.length > 0) {
            console.log('Validating milestone data...');

            const uploadMilestones = await Promise.all(milestones.map(async (ms, index) => {
                console.log(`Milestone ${index + 1}:`, ms)
                const milestone = await prisma.milestone.findUnique({
                    where: { id: ms.id },
                    include: { node: true }
                })

                // don't upload milestone data to typesense if
                // 1. milestone doesn't exist
                // 2. milestone is private
                if (!milestone || milestone.private) return null;

                return {
                    ...milestone,
                    nodeType: milestone.nodeType,
                    updatedAt: new Date(milestone.updatedAt).getTime(), // Convert to int64
                }
            }))


            const validMilestones = uploadMilestones.filter(Boolean);

            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', validMilestones);
        } else {
            console.log('No milestones to import.');
        }

        if (companies.length > 0) {
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'companies', companies);
        } else {
            console.log('No companies to import.');
        }

        if (biosamples.length > 0) {
            const uploadBiosamples = biosamples.map(biosample => ({
                ...biosample,
                id_sort: stringToSortableInt(biosample.id),
                createdAt: biosample.createdAt.getTime(), // special case for created at to enable sorting
                // special case to allow typesense sorting on the id string
                sortId: {id: biosample.id},
                availability: handleGetAvailability(biosample),
                // special case for types to enable searching by label & sorting include all info, and only include one type
                type: BIOSAMPLE_TYPE_OPTIONS.filter(option => biosample.types.includes(option.value))[0],
                // special case for conditions to enable sorting include only one condition
                condition: biosample.organization?.conditions && biosample.organization.conditions.length > 0 && biosample.organization.conditions[0].condition,
                genotype: {genotype: biosample.genotype},
            }))
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'biosamples', uploadBiosamples);
        } else {
            console.log('No biosamples to import.');
        }

        if (diseaseModels.length > 0) {
            const uploadDiseaseModels = diseaseModels.map(diseaseModel => ({
                ...diseaseModel,
                id_sort: stringToSortableInt(diseaseModel.id),
                createdAt: diseaseModel.createdAt.getTime(), // special case for created at to enable sorting
                // special case to allow typesense sorting on the id string
                sortId: {id: diseaseModel.id},
                availability: handleGetAvailability(diseaseModel),
                // special case for types to enable searching by label & sorting include all info, and only include one type
                type: DISEASE_MODEL_TYPE_OPTIONS.filter(option => diseaseModel.types.includes(option.value))[0],
                // special case for conditions to enable sorting include only one condition
                condition: diseaseModel.organization?.conditions && diseaseModel.organization.conditions.length > 0 && diseaseModel.organization.conditions[0].condition,
                genotype: {genotype: diseaseModel.genotype},
                strain: {strain: diseaseModel.strain},
            }))
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'disease-models', uploadDiseaseModels);
        } else {
            console.log('No disease models to import.');
        }

        if (clinicalDatasets.length > 0) {
            const uploadClinicalDatasets = clinicalDatasets.map(dataset => ({
                // id: dataset.id,
                // title: dataset.title,
                // description: dataset.description,
                // // types: dataset.types,
                // types: TOOL_TYPE_OPTIONS.filter(option => dataset.types.includes(option.value)),
                // gene: dataset.gene?.symbol,
                // conditions: dataset.organization?.conditions?.map(condition => condition.condition?.name) || [],
                // organization: dataset.organization

                ...dataset,
                id_sort: stringToSortableInt(dataset.id),
                createdAt: dataset.createdAt.getTime(), // special case for created at to enable sorting
                // special case to allow typesense sorting on the id string
                sortId: {id: dataset.id},
                // special case to allow typesense sorting on the title string
                title: {title: dataset.title},
                availability: handleGetAvailability(dataset),
                // special case for types to enable searching by label & sorting include all info, and only include one type
                type: TOOL_TYPE_OPTIONS.filter(option => dataset.types.includes(option.value))[0],
                // special case for conditions to enable sorting include only one condition
                condition: dataset.organization?.conditions && dataset.organization.conditions.length > 0 && dataset.organization.conditions[0].condition
            }))
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'clinical-datasets', uploadClinicalDatasets);
        } else {
            console.log('No clinical datasets to import.');
        }

        if (rfps.length > 0) {
            const uploadRFPs = rfps.map(rfp => ({
                ...rfp,
                createdAt: rfp.createdAt.getTime(), // special case for created at to enable sorting
                condition: rfp.organization?.conditions && rfp.organization.conditions.length > 0 && rfp.organization.conditions[0].condition,
                sort_rank: getSortRank(rfp as any),
                status: checkDateRangeUTC(rfp.startDate || undefined, rfp.endDate || undefined)?.status || 'Open'
            }))
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'rfps', uploadRFPs);
        } else {
            console.log('No rfps to import.');
        }

        console.log('Sync job completed successfully.');
        return { status: 'success', message: 'Sync job completed successfully.' };
    } catch (error) {
        console.error('syncToTypesense job failed:', error);
        throw error;
    }
};

const { tmpdir } = require("os")
const fs = require("fs")

function writeDecodedFile(filename: string, base64Content: any) {
    const filePath = `${tmpdir()}/${filename}`
    const contentBuffer = Buffer.from(base64Content, "base64")

    try {
        fs.writeFileSync(filePath, contentBuffer)
        console.log(`${filename} successfully written to ${filePath}`)
        console.log(`File exists: ${fs.existsSync(filePath)}`)
    } catch (err) {
        console.error(`Error writing ${filename}:`, err)
        throw err
    }
}


export async function POST(req: Request) {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: (
                process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                    ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                    : process.env.TYPESENSE_ADMIN_API_KEY
            )!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        if (process.env.CLIENT_CERT_BASE64) {
            writeDecodedFile("client-cert.pem", process.env.CLIENT_CERT_BASE64)
        } else {
            console.error("CLIENT_CERT_BASE64 environment variable is not set.")
        }
        
        if (process.env.CLIENT_KEY_BASE64) {
            writeDecodedFile("client-key.pem", process.env.CLIENT_KEY_BASE64)
        } else {
            console.error("CLIENT_KEY_BASE64 environment variable is not set.")
        }
        
        if (process.env.SERVER_CA_BASE64) {
            writeDecodedFile("server-ca.pem", process.env.SERVER_CA_BASE64)
        } else {
            console.error("SERVER_CA_BASE64 environment variable is not set.")
        }

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: (
                process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                    ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                    : process.env.TYPESENSE_ADMIN_API_KEY
            )!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        if (process.env.CLIENT_CERT_BASE64) {
            writeDecodedFile("client-cert.pem", process.env.CLIENT_CERT_BASE64)
        } else {
            console.error("CLIENT_CERT_BASE64 environment variable is not set.")
        }
        
        if (process.env.CLIENT_KEY_BASE64) {
            writeDecodedFile("client-key.pem", process.env.CLIENT_KEY_BASE64)
        } else {
            console.error("CLIENT_KEY_BASE64 environment variable is not set.")
        }
        
        if (process.env.SERVER_CA_BASE64) {
            writeDecodedFile("server-ca.pem", process.env.SERVER_CA_BASE64)
        } else {
            console.error("SERVER_CA_BASE64 environment variable is not set.")
        }

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
