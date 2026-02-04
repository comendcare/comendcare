// This seed script is meant to help during development, and not to be used to seed production databases
import prisma from "@comend/lib/prisma"
import {seed as seedMilestoneTypes} from './milestone-type-seed'
import {seed as seedGenes} from './gene-seed'
import {seed as seedCROs} from "./cro-seed"
import {seed as seedInstitutions} from "./institution-seed"
import ASOResearchPlan from './../../packages/data/research-plan-templates/ASO Research Plan-cmaqujvbw00007u8av9kl1u60.json'
import { Gene } from "@prisma/client"

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

    // Seed Roadmaps/Research Plans
    const [
        arcadionRoadmap,
        lysorinRoadmap,
        cardiomeRoadmap,
        pulmonyxRoadmap,
        xenaraRoadmap
    ] = await Promise.all([
        createRoadmap(arcadion.id, ASOResearchPlan),
        createRoadmap(lysorin.id, ASOResearchPlan),
        createRoadmap(cardiome.id, ASOResearchPlan),
        createRoadmap(pulmonyx.id, ASOResearchPlan),
        createRoadmap(xenara.id, ASOResearchPlan),
    ])

    // Seed Tools (biosamples, disease models, and clinical datasets)
    const [
        arcadionBiosamples,
        lysorinBiosamples,
        cardiomeBiosamples,
        pulmonyxBiosamples,
        xenaraBiosamples,
        arcadionDiseaseModels,
        lysorinDiseaseModels,
        cardiomeDiseaseModels,
        pulmonyxDiseaseModels,
        xenaraDiseaseModels,
        arcadionTools,
        lysorinTools,
        cardiomeTools,
        pulmonyxTools,
        xenaraTools,
    ] = await Promise.all([
        createDefaultBiosamples(arcadion.id),
        createDefaultBiosamples(lysorin.id),
        createDefaultBiosamples(cardiome.id),
        createDefaultBiosamples(pulmonyx.id),
        createDefaultBiosamples(xenara.id),
        createDefaultDiseaseModels(arcadion.id),
        createDefaultDiseaseModels(lysorin.id),
        createDefaultDiseaseModels(cardiome.id),
        createDefaultDiseaseModels(pulmonyx.id),
        createDefaultDiseaseModels(xenara.id),
        createDefaultTools(arcadion.id),
        createDefaultTools(lysorin.id),
        createDefaultTools(cardiome.id),
        createDefaultTools(pulmonyx.id),
        createDefaultTools(xenara.id),
    ])

    // Seed RFPs
    const [
        arcadionRFPs,
        lysorinRFPs,
        cardiomeRFPs,
        pulmonyxRFPs,
        xenaraRFPs,
    ] = await Promise.all([
        createDefaultRFPs(arcadion.id),
        createDefaultRFPs(lysorin.id),
        createDefaultRFPs(cardiome.id),
        createDefaultRFPs(pulmonyx.id),
        createDefaultRFPs(xenara.id),
    ])
}

export const createRoadmap = async (
  organizationId: string,
  roadmapTemplate: any,
) => {
  if (!organizationId) {
    throw new Error("No organization id provided.")
  }

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Create roadmap
    const roadmap = await tx.roadmap.create({
      data: {
        private: false,
        title: roadmapTemplate?.title,
        description: roadmapTemplate?.description,
        content: roadmapTemplate?.content ?? null,
        image: roadmapTemplate?.image ?? null,
        organization: { connect: { id: organizationId } },
        modalities: roadmapTemplate?.modalities ?? [],
        stages: roadmapTemplate?.stages ?? [],
        statuses: roadmapTemplate?.statuses ?? [],
        links: {
          create: (roadmapTemplate?.links ?? []).map((l: any) => ({
            name: l.name ?? undefined,
            link: l.link,
          })),
        },
        partners: {
          create: (roadmapTemplate?.partners ?? []).map((p: any) => ({
            name: p.name,
            email: p.email,
            role: p.role ?? undefined,
            affiliation: p.affiliation ?? undefined,
          })),
        },
        ...(roadmapTemplate?.metadata
          ? { metadata: roadmapTemplate.metadata }
          : {}),
      },
    })

    // Maps template IDs → new IDs
    const nodeIdMap = new Map<string, string>()
    const milestoneIdMap = new Map<string, string>()

    // 2️⃣ Create nodes
    if (roadmapTemplate?.nodes?.length) {
      for (const node of roadmapTemplate.nodes) {
        const newNode = await tx.node.create({
          data: {
            roadmapId: roadmap.id,
            positionX: node.positionX,
            positionY: node.positionY,
            origin: node.origin ?? [0, 0],
            metadata: node.metadata ?? undefined,
          },
        })

        nodeIdMap.set(node.id, newNode.id)
      }
    }

    // 3️⃣ Create milestones (linked to nodes)
    if (roadmapTemplate?.milestones?.length) {
      const sortedMilestones = [...roadmapTemplate.milestones].sort(
        (a: any, b: any) => (a.timelineOrder ?? 0) - (b.timelineOrder ?? 0),
      )

      for (const milestone of sortedMilestones) {

        const newNodeId = milestone.nodeId
          ? nodeIdMap.get(milestone.nodeId)
          : undefined

        const newMilestone = await tx.milestone.create({
          data: {
            roadmapId: roadmap.id,
            organizationId,
            title: milestone.title,
            description: milestone.description ?? null,
            notes: milestone.notes ?? null,
            status: milestone.status ?? "PLANNED",
            budget: milestone.budget ?? null,
            startDate: milestone.startDate
              ? new Date(milestone.startDate)
              : null,
            endDate: milestone.endDate
              ? new Date(milestone.endDate)
              : null,
            private: false,
            openTo: milestone.openTo ?? [],
            timelineOrder: milestone.timelineOrder ?? 0,
            nodeType: milestone.nodeType ?? "PROJECT",
            nodeId: newNodeId,
            metadata: milestone.metadata ?? undefined,

            // milestone types
            types: {
              create: (milestone.types ?? []).map((t: any) => ({
                milestoneTypeId: t.milestoneTypeId,
              })),
            },
          },
        })

        milestoneIdMap.set(milestone.id, newMilestone.id)
      }
    }

    // 4️⃣ Create edges (using new node IDs)
    if (roadmapTemplate?.edges?.length) {
      for (const edge of roadmapTemplate.edges) {
        const source = nodeIdMap.get(edge.source)
        const target = nodeIdMap.get(edge.target)

        if (!source || !target) continue

        await tx.edge.create({
          data: {
            roadmapId: roadmap.id,
            source,
            target,
            type: edge.type ?? undefined,
            data: edge.data ?? undefined,
            metadata: edge.metadata ?? undefined,
          },
        })
      }
    }

    // 5️⃣ Return fully-hydrated roadmap
    return await tx.roadmap.findUnique({
      where: { id: roadmap.id },
      include: {
        nodes: true,
        edges: true,
        organization: true,
        milestones: {
          include: {
            node: true,
            contacts: true,
            attachments: true,
            types: { include: { milestoneType: true } },
            tools: { include: { tool: true } },
            rfps: { include: { rfp: true } },
          },
        },
      },
    })
  })
}

export async function createDefaultBiosamples(organizationId: string) {
    // find first gene and company for link
    const firstGene = await prisma.gene.findFirst({
        orderBy: { id: "asc" },
    })
    const firstCRO = await prisma.company.findFirst({
        orderBy: { title: "asc" }
    })

    const donor = await prisma.donor.create({
        data: {
            internalId: "DONOR001",
            sex: "F",
            race: "W",
            species: "Human",
            organizationId,
        },
    })

  return await Promise.all([
    // ─────────────────────────────
    // MINIMAL BIOSAMPLE
    // ─────────────────────────────
    prisma.biosample.create({
      data: {
        organizationId,
        private: false,
        pinned: false,
        types: ["IPSCS"],
        genes: [],
        availability: "Available upon request",
        notes: "Basic biosample record. Limited metadata available.",
      },
    }),
    // ─────────────────────────────
    // RICH BIOSAMPLE
    // ─────────────────────────────
    prisma.biosample.create({
        data: {
            organizationId,
            donorId: donor.id,
            private: false,
            pinned: true,
            description:
            "Patient-derived fibroblast sample collected for translational research and assay development.",
            types: ["FIBROBLAST"],
            genes: firstGene ? [firstGene.symbol!] : [], // use symbol if gene exists
            geneId: firstGene ? firstGene.id : undefined, // link the first gene if exists
            companyId: firstCRO ? firstCRO.id : undefined,
            genotype: "Homozygous pathogenic variant",
            bsiId: "SAMPLE",
            variant: "c.1234A>T",
            availability: "Available for academic research",
            quantity: 3,
            quantityUnit: "vials",
            currentCountry: "United States",
            countryOfCollection: "United States",
            preservationMethod: "Cryopreserved",
            anatomicalSite: "Skin biopsy",
            methodOfTransport: "Dry ice",
            ageAtCollection: 12,
            collectionDate: new Date("2021-06-15"),
            price: 500,
            priceUnit: "USD",
            metadata: {
                qcStatus: "completed",
                consentType: "broad research consent",
            },
            contacts: {
            create: [
                {
                    name: "Biorepository Manager",
                    role: "Sample Access",
                    email: "biobank@foundation.org",
                    affiliation: "Biorepository",
                },
            ],
            },
            attachments: {
            create: [
                {
                    name: "Sample QC Report",
                    link: "https://example.org/biosample-qc.pdf",
                },
            ],
            },
            notes:
            "Sample consent allows use in academic and preclinical industry research.",
        },
        include: {
            donor: true, // return donor details as well
        },
    })
  ])
}

export async function createDefaultDiseaseModels(
  organizationId: string,
  conditionId?: string // optional but useful
) {
    // find first gene and company for link
    const firstGene = await prisma.gene.findFirst({
        orderBy: { id: "asc" },
    })
    const firstCRO = await prisma.company.findFirst({
        orderBy: { title: "asc" }
    })

  return await Promise.all([
    // ─────────────────────────────
    // MINIMAL DISEASE MODEL
    // ─────────────────────────────
    prisma.diseaseModel.create({
      data: {
        organizationId,
        private: false,
        pinned: false,
        types: ["NON_HUMAN_PRIMATES"],
        genes: [],
        notes: "Early-stage disease model under development.",
      },
    }),
    // ─────────────────────────────
    // RICH DISEASE MODEL
    // ─────────────────────────────
    prisma.diseaseModel.create({
      data: {
        organizationId,
        conditionId,
        private: false,
        pinned: true,
        description:
          "Patient-derived iPSC neuronal model recapitulating key disease phenotypes.",
        genes: firstGene ? [firstGene.symbol!] : [], // use symbol if gene exists
        geneId: firstGene ? firstGene.id : undefined, // link the first gene if exists
        companyId: firstCRO ? firstCRO.id : undefined,
        types: ["MOUSE"],
        genotype: "Compound heterozygous",
        strain: "Human iPSC line",
        metadata: {
          differentiationProtocol: "Cortical neuron differentiation v2",
          validationStatus: "functionally validated",
        },
        contacts: {
          create: [
            {
              name: "Principal Investigator",
              role: "Model Development",
              email: "pi@foundation.org",
              affiliation: "Research Lab",
            },
          ],
        },
        attachments: {
          create: [
            {
              name: "Model Characterization Data",
              link: "https://example.org/disease-model-characterization.pdf",
            },
          ],
        },
        notes:
          "Model shows reproducible disease phenotypes suitable for drug screening.",
      },
    }),
  ])
}

export async function createDefaultTools(organizationId: string) {
    // find first gene and company for link
    const firstGene = await prisma.gene.findFirst({
        orderBy: { id: "asc" },
    })
    const firstCRO = await prisma.company.findFirst({
        orderBy: { title: "asc" }
    })

  return await Promise.all([
    // ─────────────────────────────
    // MINIMAL TOOL
    // ─────────────────────────────
    prisma.tool.create({
      data: {
        title: "Patient Registry Dataset",
        organizationId,
        private: false,
        pinned: false,
        types: ["PATIENTREGISTRY"],
        genes: [],
        notes: "Basic registry dataset available upon request.",
      },
    }),
    // ─────────────────────────────
    // RICH TOOL
    // ─────────────────────────────
    prisma.tool.create({
      data: {
        title: "Patient-Derived Cell Line Platform",
        description:
          "Collection of patient-derived fibroblast and iPSC lines available for translational research.",
        cohortSize: 12,
        organizationId,
        private: false,
        pinned: true,
        types: ["FUNCTIONALSTUDY"],
        genes: firstGene ? [firstGene.symbol!] : [], // use symbol if gene exists
        geneId: firstGene ? firstGene.id : undefined, // link the first gene if exists
        companyId: firstCRO ? firstCRO.id : undefined,
        metadata: {
          materialType: ["fibroblast", "iPSC"],
          qcCompleted: true,
          storage: "LN2",
        },
        contacts: {
          create: [
            {
              name: "Biorepository Manager",
              role: "Sample Access",
              email: "biobank@foundation.org",
              affiliation: "Biorepository",
            },
            {
              name: "Scientific Director",
              role: "Scientific Oversight",
              email: "science@foundation.org",
              affiliation: "Research Leadership",
            },
          ],
        },
        attachments: {
          create: [
            {
              name: "Cell Line Characterization",
              link: "https://example.org/cell-line-qc.pdf",
            },
            {
              name: "Material Transfer Agreement",
              link: "https://example.org/mta.pdf",
            },
          ],
        },
        notes:
          "Available to academic and industry partners. MTA and project proposal required.",
      },
    }),
  ])
}

export async function createDefaultRFPs(organizationId: string) {
  return await Promise.all([
    // ─────────────────────────────
    // MINIMAL RFP
    // ─────────────────────────────
    prisma.rFP.create({
      data: {
        organizationId,
        title: "Seed Minimal RFP",
        description: "Basic RFP with minimal fields",
        private: false,
        pinned: false,
        openTo: [],
      },
    }),

    // ─────────────────────────────
    // RICH RFP
    // ─────────────────────────────
    prisma.rFP.create({
      data: {
        organizationId,
        title: "Seed Rich RFP: Antisense Therapy Initiative",
        description:
          "Request for proposals to develop preclinical antisense oligonucleotide therapies targeting rare neurodegenerative disorders.",
        eligibility: "Academic institutions, biotech startups, or consortia",
        instructions:
          "Submit proposals via our portal including methodology, timeline, and budget breakdown.",
        evaluationProcess:
          "Proposals will be evaluated based on innovation, feasibility, and alignment with organizational priorities.",
        openTo: ["ACADEMIC", "CRO"],
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-06-01"),
        budget: 500000,
        private: false,
        pinned: true,
        contacts: {
          create: [
            {
              name: "RFP Coordinator",
              role: "Contact for questions",
              email: "rfp-coordinator@foundation.org",
              affiliation: "Org Admin",
            },
          ],
        },
        attachments: {
          create: [
            {
              name: "RFP Guidelines",
              link: "https://example.org/rfp-guidelines.pdf",
            },
            {
              name: "Budget Template",
              link: "https://example.org/rfp-budget.xlsx",
            },
          ],
        },
        notes: "Rich RFP example including contacts, attachments, and metadata.",
      },
    }),
  ])
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
