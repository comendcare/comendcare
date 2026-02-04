// This seed script is meant to help during development, and not to be used to seed production databases
import prisma from "@comend/lib/prisma"
import {seed as seedMilestoneTypes} from './milestone-type-seed'
import {seed as seedGenes} from './gene-seed'
import {seed as seedCROs} from "./cro-seed"
import {seed as seedInstitutions} from "./institution-seed"

import {createNodesAndEdgesFromTemplate} from './../../packages/lib/actions'

import ASOResearchPlan from './../../packages/data/research-plan-templates/ASO Research Plan-cmaqujvbw00007u8av9kl1u60.json'
import GeneTherapyResearchPlan from './../../packages/data/research-plan-templates/Gene-Therapy-Template.json'
import DrugScreenResearchPlan from './../../packages/data/research-plan-templates/Drug-Screen-Template.json'

export async function whitelistEmails(emails: (string | null)[]) {
    if (!emails?.length) return;

    // De-dupe + strip empties just in case
    const unique = Array.from(new Set(emails.filter(email => email !== null)));

    await prisma.whitelist.createMany({
        data: unique.map((email) => ({ email })),
        skipDuplicates: true, // <- avoids errors if already whitelisted
    });
}

async function main() {
    /* 
        SEED ESSENTIAL DATA - seed all data needed for dropdowns to fill properly, and types to work
        ---------------------------------------------------------------------------------------------------
    */
   await Promise.all([
        seedMilestoneTypes(),
        seedGenes(),
        seedCROs(),
        seedInstitutions(),
   ])

    /* 
        SEED USER DATA 
            - seed all data needed to simulate existing users on the application
            - set up the whitelist & blacklist
        ---------------------------------------------------------------------------------------------------
    */
    const [
        flawnson, flawnsonTwo, albert, betty, megan, alice, bob, charlie, dave, eve, frank, grace,  heidi, ivan
    ] = await Promise.all([
        prisma.user.upsert({
            where: {email: 'flawnsontong1@gmail.com'},
            update: {},
            create: {
                email: 'flawnsontong1@gmail.com',
                name: 'Flawnson Tong',
            },
        }),
        prisma.user.upsert({
            where: {email: 'flawnson@comendcare.com'},
            update: {},
            create: {
                email: 'flawnson@comendcare.com',
                name: 'Flawnson Tong',
            },
        }),
        prisma.user.upsert({
            where: {email: 'albert@comendcare.com'},
            update: {},
            create: {
                email: 'albert@comendcare.com',
                name: 'Albert Wang',
            },
        }),
        prisma.user.upsert({
            where: {email: 'betty.trevino@comendcare.com'},
            update: {},
            create: {
                email: 'betty.trevino@comendcare.com',
                name: 'Betty Trevino',
            },
        }),
        prisma.user.upsert({
            where: {email: 'megan@comendcare.com'},
            update: {},
            create: {
                email: 'megan@comendcare.com',
                name: 'Megan McClure',
            }
        }),
        prisma.user.upsert({
            where: {email: 'alice@prisma.io'},
            update: {},
            create: {
                email: 'alice@prisma.io',
                name: 'Alice',
            },
        }),
        prisma.user.upsert({
            where: {email: 'bob@prisma.io'},
            update: {},
            create: {
                email: 'bob@prisma.io',
                name: 'Bob',
            },
        }),
        prisma.user.upsert({
            where: {email: 'charlie@prisma.io'},
            update: {},
            create: {
                email: 'charlie@prisma.io',
                name: 'Charlie',
            },
        }),
        prisma.user.upsert({
            where: {email: 'dave@prisma.io'},
            update: {},
            create: {
                email: 'dave@prisma.io',
                name: 'Dave',
            },
        }),
        prisma.user.upsert({
            where: {email: 'eve@prisma.io'},
            update: {},
            create: {
                email: 'eve@prisma.io',
                name: 'Eve',
            },
        }),
        prisma.user.upsert({
            where: {email: 'frank@prisma.io'},
            update: {},
            create: {
                email: 'frank@prisma.io',
                name: 'Frank',
            },
        }),
        prisma.user.upsert({
            where: {email: 'grace@prisma.io'},
            update: {},
            create: {
                email: 'grace@prisma.io',
                name: 'Grace',
            },
        }),
        prisma.user.upsert({
            where: {email: 'heidi@prisma.io'},
            update: {},
            create: {
                email: 'heidi@prisma.io',
                name: 'Heidi',
            },
        }),
        prisma.user.upsert({
            where: {email: 'ivan@prisma.io'},
            update: {},
            create: {
                email: 'ivan@prisma.io',
                name: 'Ivan',
            },
        })
    ])

    await whitelistEmails(
        (await prisma.user.findMany({ select: { email: true } })).map(u => u.email)
    )

    /* 
        SEED ORGANIZATION DATA 
            - seed all data associated with organizations
            - org, members (using previously created users), condition

            - org minimally filled
            - org with everything

            - tools & rfps - maximally filled & minimally filled
        ---------------------------------------------------------------------------------------------------
    */
    const [
        celocyn,
        arcadion,
        aurorin,
        helixia,
        neurexa,
        mitovia,
        lysorin,
        cardiome,
        pulmonyx,
        xenara,
    ] = await Promise.all([
        prisma.organization.create({ // minimally completed organization
            data: {
                name: "Celocyn Syndrome Foundation",
                verified: true,
                subdomain: "celocyn",
                customDomain: "celocyn",
                user: {
                    connect: {
                        id: bob.id
                    }
                },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: "flawnson@comendcare.com",
                            title: "Director of Testing",
                            user: {
                                connect: {
                                    email: "flawnson@comendcare.com",
                                },
                            },
                        },
                        {
                            role: "owner",
                            email: "megan@comendcare.com",
                            title: "Researcher",
                            user: {
                                connect: {
                                    email: "megan@comendcare.com",
                                },
                            },
                        },
                        {
                            role: "owner",
                            email: "albert@comendcare.com",
                            title: "Scientific Director",
                            user: {
                                connect: {
                                    email: "albert@comendcare.com",
                                },
                            },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({ // maximally completed organization
            data: {
                name: "Arcadion Disease Foundation",
                verified: true,
                description: "The Arcadion Disease Foundation supports research and advocacy for Arcadion Disease, a progressive and degenerative disorder affecting the central nervous system.",
                subdomain: "arcadion",
                customDomain: "arcadion",
                yearFounded: "2015",
                incorporationStatus: "YES",
                therapeuticsOfInterest: ["Gene Therapy (AAV)", "Gene Editing"],
                website: "https://www.example.org/",
                moneyRaised: 3200000,
                moneyDeployed: 1200000,
                researchBudget: 800000,
                user: {
                    connect: {
                        id: flawnson.id
                    }
                },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: "flawnsontong1@gmail.com",
                            title: "Director of Research",
                            user: {
                                connect: {
                                    email: "flawnsontong1@gmail.com",
                                },
                            },
                        },
                        {
                            role: "owner",
                            email: "flawnson@comendcare.com",
                            title: "Director of Testing",
                            user: {
                                connect: {
                                    email: "flawnson@comendcare.com",
                                },
                            },
                        },
                        {
                            role: "owner",
                            email: "megan@comendcare.com",
                            title: "Researcher",
                            user: {
                                connect: {
                                    email: "megan@comendcare.com",
                                },
                            },
                        },
                        {
                            role: "owner",
                            email: "albert@comendcare.com",
                            title: "Scientific Director",
                            user: {
                                connect: {
                                    email: "albert@comendcare.com",
                                },
                            },
                        },
                        {
                            role: "member",
                            email: "ivan@prisma.io",
                            title: "Patient Engagement Lead",
                            user: {
                                connect: {
                                    email: "ivan@prisma.io",
                                },
                            },
                        },
                        {
                            role: "member",
                            email: "heidi@prisma.io",
                            title: "Patient Engagement Lead",
                            user: {
                                connect: {
                                    email: "heidi@prisma.io",
                                },
                            },
                        }
                    ],
                },
                conditions: {
                    create: { // ConditionToOrganization
                        condition: {
                            create: {
                                name: "Arcadion Disease",
                                slug: "arcadion-disease",
                                nordURL: "https://rarediseases.org/rare-diseases/arcadion-disease/",
                                gardURL: "https://www.ncbi.nlm.nih.gov/gard/arcadion-disease/",
                                summary: "Arcadion Disease is a progressive and degenerative disorder affecting the central nervous system, leading to severe physical and cognitive decline.",
                                description: "Arcadion Disease is a rare, progressive disorder that profoundly impacts the central nervous system, causing a cascade of debilitating physical and cognitive symptoms. Patients with Arcadion Disease typically experience an insidious onset of muscle weakness, memory loss, and difficulty swallowing, all of which contribute to a significant decline in quality of life. This disease is categorized as a neurodegenerative disorder and is driven by complex mechanisms, including genetic mutations and mitochondrial dysfunction. Two genes, ARC1 and NEU4, have been implicated in the disease, providing critical insights into its pathogenesis. Ongoing research aims to develop innovative therapies, including gene therapy and CRISPR-based strategies, to halt or reverse the disease's progression. The prevalence of Arcadion Disease is estimated to be 1 in 700,000 individuals, with only 22 patients identified worldwide. Research efforts are supported by valuable resources such as the Arcadion Patient Registry and the Natural History Study, which serve to enhance our understanding of the disease trajectory. Current development efforts include a gene therapy vector and patient-derived cell lines, which represent promising tools for testing and validation. Despite its rarity, Arcadion Disease remains a focus of dedicated scientific inquiry and advocacy due to its devastating impact on affected individuals and their families.",
                                diseaseCategories: ["Neurodegenerative Disorder"],
                                prevalenceNumerator: 1,
                                prevalenceDenominator: 700000,
                                prevalenceRatio: 1 / 700000,
                                numberOfPatientsEngaged: 22,
                                relevantDiseaseMechanisms: ["LOSS_OF_FUNCTION"],
                                associatedSystems: ["Musculoskeletal"],
                                associatedGenes: ["ARC1", "NEU4"],
                                associatedSignsAndSymptoms: ["Muscle weakness", "Memory loss", "Difficulty swallowing"],
                                existingDatabasesAndStudies: ["Arcadion Patient Registry", "Arcadion Disease Natural History Study"],
                                toolsUnderDevelopment: ["Gene therapy vector", "Patient-derived cell line"],
                            }
                        }
                    }
                }
            },
        }),
        // ─────────────────────────────
        // MINIMAL ORGS
        // ─────────────────────────────
        prisma.organization.create({
            data: {
                name: "Aurorin Foundation",
                verified: false,
                subdomain: "aurorin",
                customDomain: "aurorin",
                user: { connect: { id: alice.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: alice.email || '',
                            title: "Founder",
                            user: { connect: { id: alice.id } },
                        },
                        {
                            role: "member",
                            email: bob.email || '',
                            title: "Advisor",
                            user: { connect: { id: bob.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Helixia Research Trust",
                verified: true,
                subdomain: "helixia",
                customDomain: "helixia",
                user: { connect: { id: charlie.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: charlie.email || '',
                            title: "Executive Director",
                            user: { connect: { id: charlie.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Neurexa Initiative",
                verified: false,
                subdomain: "neurexa",
                customDomain: "neurexa",
                user: { connect: { id: dave.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: dave.email || '',
                            title: "Program Lead",
                            user: { connect: { id: dave.id } },
                        },
                        {
                            role: "member",
                            email: eve.email || '',
                            title: "Research Coordinator",
                            user: { connect: { id: eve.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Mitovia Collective",
                verified: true,
                subdomain: "mitovia",
                customDomain: "mitovia",
                user: { connect: { id: frank.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: frank.email || '',
                            title: "Founder",
                            user: { connect: { id: frank.id } },
                        },
                    ],
                },
            },
        }),
        // ─────────────────────────────
        // RICH ORGS
        // ─────────────────────────────
        prisma.organization.create({
            data: {
                name: "Lysorin Disease Alliance",
                verified: true,
                description:
                    "The Lysorin Disease Alliance accelerates research into rare lysosomal disorders through funding, collaboration, and patient engagement.",
                subdomain: "lysorin",
                customDomain: "lysorin",
                yearFounded: "2012",
                incorporationStatus: "YES",
                therapeuticsOfInterest: ["Enzyme Replacement Therapy", "Small Molecules"],
                website: "https://www.example.org/",
                moneyRaised: 2100000,
                moneyDeployed: 1450000,
                researchBudget: 600000,
                city: "Boston",
                region: "MA",
                country: "United States",
                user: { connect: { id: betty.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: betty.email || '',
                            title: "Executive Director",
                            user: { connect: { id: betty.id } },
                        },
                        {
                            role: "member",
                            email: grace.email || '',
                            title: "Scientific Advisor",
                            user: { connect: { id: grace.id } },
                        },
                        {
                            role: "member",
                            email: heidi.email || '',
                            title: "Patient Engagement",
                            user: { connect: { id: heidi.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Cardiome Research Foundation",
                verified: true,
                description:
                    "Focused on rare genetic cardiomyopathies, Cardiome supports translational research and early therapeutic development.",
                subdomain: "cardiome",
                customDomain: "cardiome",
                yearFounded: "2018",
                incorporationStatus: "YES",
                therapeuticsOfInterest: ["Gene Therapy", "RNA Therapeutics"],
                therapeuticsInDevelopment: ["AAV Gene Therapy"],
                website: "https://www.example.org/",
                moneyRaised: 4800000,
                moneyDeployed: 2600000,
                researchBudget: 1200000,
                city: "Toronto",
                region: "ON",
                country: "Canada",
                user: { connect: { id: megan.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: megan.email || '',
                            title: "Scientific Director",
                            user: { connect: { id: megan.id } },
                        },
                        {
                            role: "member",
                            email: albert.email || '',
                            title: "Clinical Strategy",
                            user: { connect: { id: albert.id } },
                        },
                        {
                            role: "member",
                            email: ivan.email || '',
                            title: "Community Partnerships",
                            user: { connect: { id: ivan.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Pulmonyx Foundation",
                verified: false,
                description:
                    "Pulmonyx advances research into rare interstitial lung diseases through grants and patient registries.",
                subdomain: "pulmonyx",
                customDomain: "pulmonyx",
                yearFounded: "2016",
                incorporationStatus: "NO",
                therapeuticsOfInterest: ["Small Molecules", "Biologics"],
                website: "https://www.example.org/",
                moneyRaised: 950000,
                moneyDeployed: 400000,
                researchBudget: 250000,
                city: "San Diego",
                region: "CA",
                country: "United States",
                user: { connect: { id: bob.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: bob.email || '',
                            title: "Founder",
                            user: { connect: { id: bob.id } },
                        },
                        {
                            role: "member",
                            email: alice.email || '',
                            title: "Operations",
                            user: { connect: { id: alice.id } },
                        },
                    ],
                },
            },
        }),
        prisma.organization.create({
            data: {
                name: "Xenara Rare Disease Network",
                verified: true,
                description:
                    "Xenara connects researchers, clinicians, and families to accelerate discovery across ultra-rare diseases.",
                subdomain: "xenara",
                customDomain: "xenara",
                yearFounded: "2020",
                incorporationStatus: "YES",
                therapeuticsOfInterest: ["Gene Editing", "Antisense Oligonucleotides"],
                website: "https://www.example.org/",
                moneyRaised: 1750000,
                moneyDeployed: 900000,
                researchBudget: 500000,
                city: "New York",
                region: "NY",
                country: "United States",
                user: { connect: { id: flawnson.id } },
                members: {
                    create: [
                        {
                            role: "owner",
                            email: flawnson.email || '',
                            title: "Executive Director",
                            user: { connect: { id: flawnson.id } },
                        },
                        {
                            role: "member",
                            email: flawnsonTwo.email || '',
                            title: "Platform Engineering",
                            user: { connect: { id: flawnsonTwo.id } },
                        },
                        {
                            role: "member",
                            email: grace.email || '',
                            title: "Research Programs",
                            user: { connect: { id: grace.id } },
                        },
                    ],
                },
            },
        }),
    ])

    const celocynRoadmap = await createRoadmap(celocyn.id, ASOResearchPlan)

    // // Create roadmaps for each foundation
    // const celocynRoadmap = await createRoadmap(
    //     celocyn.id, exampleASORoadmap
    // )
    // const lysogeneRoadmap = await createRoadmap(
    //     lysogeneFoundation.id, exampleASORoadmap
    // );
    // const neuroAidRoadmap = await createRoadmap(
    //     neuroAidFoundation.id, exampleASORoadmap
    // );
    // const myoparRoadmap = await createRoadmap(
    //     myoparFoundation.id, exampleASORoadmap
    // );
    // const cranioRoadmap = await createRoadmap(
    //     cranioFoundation.id, exampleASORoadmap
    // );
    // const nephroRoadmap = await createRoadmap(
    //     nephroFoundation.id, exampleASORoadmap
    // );
    // const arcadionRoadmap = await createRoadmap(
    //     arcadion.id, exampleASORoadmap
    // )
}

export const createRoadmap = async (
    organizationId: string,
    roadmapTemplate: any,
) => {
    try {
        if (!organizationId) {
            throw new Error("No organization id provided.");
        }

        const roadmap = await prisma.roadmap.create({
            data: {
                private: roadmapTemplate?.private,
                title: roadmapTemplate?.title,
                description: roadmapTemplate?.description,
                organization: {connect: {id: organizationId}},
                modalities: roadmapTemplate?.modalities,
                links: {
                    create: (roadmapTemplate?.links || [])
                        .map((a: any) => ({ link: a.link, name: a.name ?? undefined })),
                },
                partners: {
                    create: (roadmapTemplate?.partners || [])
                        .map((c: any) => ({ name: c.name, email: c.email, role: c.role ?? undefined, affiliation: c.affiliation ?? undefined })),
                },
                stages: roadmapTemplate?.stages || [],
                statuses: roadmapTemplate?.statuses || [],
                ...(roadmapTemplate?.metadata ? {metadata: roadmapTemplate.metadata} : undefined),
                // published defaults to true per your model; omit to use default
            },
        });

        // If a template was provided, create nodes/edges/milestones first
        // if (roadmapTemplate?.milestones) {
        //     const sortedMilestones = roadmapTemplate?.milestones.sort((a: any, b: any) => {
        //         const aNode = roadmapTemplate?.nodes?.find((node: any) => node.id === a.nodeId)
        //         const bNode = roadmapTemplate?.nodes?.find((node: any) => node.id === b.nodeId)

        //         if (aNode?.positionX && bNode?.positionX) {
        //             return aNode.positionX - bNode.positionX
        //         } else if (aNode?.positionX) {
        //             // node a is defiend, node b is not, put node a first
        //             return -1
        //         } else if (bNode?.positionX) {
        //             // node b is defined, node b is not, put node b first
        //             return 1
        //         }

        //         // if nether is defined, don't re-sort
        //         return 0
        //     })
        //     const sortedNodes = roadmapTemplate?.nodes.sort((a: any, b: any) => {
        //         if (a?.positionX && b?.positionX) {
        //             return a.positionX - b.positionX
        //         } else if (a?.positionX) {
        //             // node a is defiend, node b is not, put node a first
        //             return -1
        //         } else if (b?.positionX) {
        //             // node b is defined, node b is not, put node b first
        //             return 1
        //         }

        //         // if nether is defined, don't re-sort
        //         return 0
        //     })

        //     // sort milestones and nodes, just in case they're not sorted properly in the template file
        //     await createNodesAndEdgesFromTemplate(organizationId, roadmap.id, {
        //         ...roadmapTemplate,
        //         milestones: sortedMilestones,
        //         nodes: sortedNodes
        //     });
        // }

        // Re-fetch with full graph
        const finalRoadmap = await prisma.roadmap.findUnique({
            where: {id: roadmap.id},
            include: {
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true,
                        types: {include: {milestoneType: true}},
                        tools: {include: {tool: true}},
                        rfps: {include: {rfp: true}},
                    },
                },
                nodes: true,
                edges: true,
                organization: true,
            },
        });

        return finalRoadmap;
    } catch (error: any) {
        console.error("Error creating roadmap:", error?.message ?? error);
        throw new Error(error?.message || "Failed to create roadmap.");
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
