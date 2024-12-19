// This seed script is meant to help during development, and not to be used to seed production databases
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const flawnson = await prisma.user.upsert({
        where: {email: 'flawnsontong1@gmail.com'},
        update: {},
        create: {
            email: 'flawnsontong1@gmail.com',
            name: 'Flawnson Tong',
        },
    })

    const albert = await prisma.user.upsert({
        where: {email: 'albert@comendcare.com'},
        update: {},
        create: {
            email: 'albert@comendcare.com',
            name: 'Albert Wang',
        },
    })

    const betty = await prisma.user.upsert({
        where: {email: 'betty.trevino@comendcare.com'},
        update: {},
        create: {
            email: 'betty.trevino@comendcare.com',
            name: 'Betty Trevino',
        },
    })

    const megan = await prisma.user.upsert({
        where: { email: 'megan@comendcare.com' },
        update: {},
        create: { 
            email: 'megan@comendcare.com',
            name: 'Megan McClure'
        }
    })

    const alice = await prisma.user.upsert({
        where: {email: 'alice@prisma.io'},
        update: {},
        create: {
            email: 'alice@prisma.io',
            name: 'Alice',
        },
    })

    const bob = await prisma.user.upsert({
        where: {email: 'bob@prisma.io'},
        update: {},
        create: {
            email: 'bob@prisma.io',
            name: 'Bob',
        },
    })

    const charlie = await prisma.user.upsert({
        where: {email: 'charlie@prisma.io'},
        update: {},
        create: {
            email: 'charlie@prisma.io',
            name: 'Charlie',
        },
    });

    const dave = await prisma.user.upsert({
        where: {email: 'dave@prisma.io'},
        update: {},
        create: {
            email: 'dave@prisma.io',
            name: 'Dave',
        },
    });

    const eve = await prisma.user.upsert({
        where: {email: 'eve@prisma.io'},
        update: {},
        create: {
            email: 'eve@prisma.io',
            name: 'Eve',
        },
    });

    const frank = await prisma.user.upsert({
        where: {email: 'frank@prisma.io'},
        update: {},
        create: {
            email: 'frank@prisma.io',
            name: 'Frank',
        },
    });

    const grace = await prisma.user.upsert({
        where: {email: 'grace@prisma.io'},
        update: {},
        create: {
            email: 'grace@prisma.io',
            name: 'Grace',
        },
    });

    const heidi = await prisma.user.upsert({
        where: {email: 'heidi@prisma.io'},
        update: {},
        create: {
            email: 'heidi@prisma.io',
            name: 'Heidi',
        },
    });

    const ivan = await prisma.user.upsert({
        where: {email: 'ivan@prisma.io'},
        update: {},
        create: {
            email: 'ivan@prisma.io',
            name: 'Ivan',
        },
    });

    console.log({alice, bob})

    const celocyn = await prisma.organization.create({
        data: {
            name: "Celocyn Syndrome Foundation",
            verified: true,
            description: "The Celocyn Syndrome Foundation supports research and advocacy for Celocyn Syndrome, a progressive and degenerative disorder affecting the brain. Since founding in 2012 we're raised millions for the development of treatments, some of which are now in clinical trials.",
            subdomain: "celocyn",
            customDomain: "celocyn",
            yearFounded: "2012",
            incorporationStatus: "YES",
            website: "https://www.random.org/",
            moneyRaised: 5000000,
            moneyDeployed: 2000000,
            researchBudget: 1000000,
            interestedModalities: ["AAV", "ASO"],
            diseaseName: "Celocyn Syndrome",
            diseaseCategories: ["Neuroencephalomyelopathy"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 1000000,
            prevalenceRatio: 1/1000000,
            numberOfIdentifiedPatients: 37,
            relevantDiseaseMechanisms: ["Neurology"],
            associatedGenes: ["GEL3", "M4SF"],
            associatedSignsAndSymptoms: ["Severe migraines", "Early onset dementia"],
            existingDatabasesAndStudies: ["Celocyn Syndrome Registry"],
            assetsUnderDevelopment: ["Mouse model", "Cell line"],
            user: {
                connect: {
                    id: bob.id
                }
            },
        },
    })

    const celocynKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: celocyn.id
                }
            }
        },
    })

    // create Celocyn Syndrome Foundation Roadmap
    const celocynRoadmap = await createRoadmap(
        celocyn.id, celocynKanban.id, exampleASORoadmap
    )

    const arcadion = await prisma.organization.create({
        data: {
            name: "Arcadion Disease Foundation",
            verified: true,
            description: "The Arcadion Disease Foundation supports research and advocacy for Arcadion Disease, a progressive and degenerative disorder affecting the central nervous system.",
            subdomain: "arcadion",
            customDomain: "arcadion",
            yearFounded: "2015",
            incorporationStatus: "YES",
            website: "https://www.example.org/",
            moneyRaised: 3200000,
            moneyDeployed: 1200000,
            researchBudget: 800000,
            interestedModalities: ["Gene Therapy", "CRISPR"],
            diseaseName: "Arcadion Disease",
            diseaseCategories: ["Neurodegenerative Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 700000,
            prevalenceRatio: 1/700000,
            numberOfIdentifiedPatients: 22,
            relevantDiseaseMechanisms: ["Genetic Mutation", "Mitochondrial Dysfunction"],
            associatedGenes: ["ARC1", "NEU4"],
            associatedSignsAndSymptoms: ["Muscle weakness", "Memory loss", "Difficulty swallowing"],
            existingDatabasesAndStudies: ["Arcadion Patient Registry", "Arcadion Disease Natural History Study"],
            assetsUnderDevelopment: ["Gene therapy vector", "Patient-derived cell line"],
            user: {
                connect: {
                    id: flawnson.id
                }
            },
        },
    });

    const lysogeneFoundation = await prisma.organization.create({
        data: {
            name: "Lysogene Foundation",
            verified: true,
            description: "The Lysogene Foundation is dedicated to finding a cure for Lysogene Syndrome, a severe genetic disorder that affects cellular lysosome function.",
            subdomain: "lysogene",
            customDomain: "lysogene",
            yearFounded: "2013",
            incorporationStatus: "YES",
            website: "https://www.lysogene.org/",
            moneyRaised: 1500000,
            moneyDeployed: 700000,
            researchBudget: 500000,
            interestedModalities: ["Enzyme Replacement Therapy", "Gene Therapy"],
            diseaseName: "Lysogene Syndrome",
            diseaseCategories: ["Lysosomal Storage Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 500000,
            prevalenceRatio: 1/500000,
            numberOfIdentifiedPatients: 58,
            relevantDiseaseMechanisms: ["Cellular Metabolism"],
            associatedGenes: ["LYSO1"],
            associatedSignsAndSymptoms: ["Organomegaly", "Developmental delay"],
            existingDatabasesAndStudies: ["Lysogene Global Registry"],
            assetsUnderDevelopment: ["Animal model", "Biomarker assays"],
            user: {
                connect: {
                    id: alice.id
                }
            },
        },
    });

    const neuroAidFoundation = await prisma.organization.create({
        data: {
            name: "NeuroAid Foundation",
            verified: true,
            description: "NeuroAid Foundation promotes research in rare neurodegenerative disorders to identify potential therapeutic pathways.",
            subdomain: "neuroaid",
            customDomain: "neuroaid",
            yearFounded: "2010",
            incorporationStatus: "YES",
            website: "https://www.neuroaid.org/",
            moneyRaised: 2500000,
            moneyDeployed: 1000000,
            researchBudget: 600000,
            interestedModalities: ["Stem Cell Therapy", "RNA Therapy"],
            diseaseName: "NeuroAid Disorder",
            diseaseCategories: ["Neurodegenerative Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 800000,
            prevalenceRatio: 1/800000,
            numberOfIdentifiedPatients: 40,
            relevantDiseaseMechanisms: ["Neuroinflammation", "Protein Aggregation"],
            associatedGenes: ["NEUA", "NF4B"],
            associatedSignsAndSymptoms: ["Loss of motor control", "Seizures"],
            existingDatabasesAndStudies: ["NeuroAid Patient Database"],
            assetsUnderDevelopment: ["Patient registry", "Preclinical model"],
            user: {
                connect: {
                    id: charlie.id
                }
            },
        },
    });

    const myoparFoundation = await prisma.organization.create({
        data: {
            name: "Myopar Foundation",
            verified: true,
            description: "Myopar Foundation supports patients and families affected by Myopar Disease, an inherited muscular disorder.",
            subdomain: "myopar",
            customDomain: "myopar",
            yearFounded: "2018",
            incorporationStatus: "YES",
            website: "https://www.myopar.org/",
            moneyRaised: 1800000,
            moneyDeployed: 800000,
            researchBudget: 450000,
            interestedModalities: ["Gene Editing", "Cell Therapy"],
            diseaseName: "Myopar Disease",
            diseaseCategories: ["Muscular Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 200000,
            prevalenceRatio: 1/200000,
            numberOfIdentifiedPatients: 15,
            relevantDiseaseMechanisms: ["Muscle Degeneration"],
            associatedGenes: ["MYOP1", "MUS2"],
            associatedSignsAndSymptoms: ["Muscle atrophy", "Fatigue", "Joint stiffness"],
            existingDatabasesAndStudies: ["Myopar Patient Registry"],
            assetsUnderDevelopment: ["Muscle cell line", "Gene editing vectors"],
            user: {
                connect: {
                    id: dave.id
                }
            },
        },
    });

    const cranioFoundation = await prisma.organization.create({
        data: {
            name: "Cranio Foundation",
            verified: true,
            description: "The Cranio Foundation supports research and advocacy for Cranio Syndrome, a craniofacial disorder with severe implications on bone structure.",
            subdomain: "cranio",
            customDomain: "cranio",
            yearFounded: "2017",
            incorporationStatus: "YES",
            website: "https://www.cranio.org/",
            moneyRaised: 2200000,
            moneyDeployed: 1100000,
            researchBudget: 500000,
            interestedModalities: ["Tissue Engineering", "Bone Morphogenetic Proteins"],
            diseaseName: "Cranio Syndrome",
            diseaseCategories: ["Craniofacial Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 900000,
            prevalenceRatio: 1/900000,
            numberOfIdentifiedPatients: 25,
            relevantDiseaseMechanisms: ["Bone Malformation"],
            associatedGenes: ["CRN1"],
            associatedSignsAndSymptoms: ["Facial deformity", "Respiratory issues"],
            existingDatabasesAndStudies: ["Cranio Patient Database"],
            assetsUnderDevelopment: ["3D-printed bone scaffolds", "Growth factor assays"],
            user: {
                connect: {
                    id: eve.id
                }
            },
        },
    });

    const nephroFoundation = await prisma.organization.create({
        data: {
            name: "Nephro Foundation",
            verified: true,
            description: "The Nephro Foundation advances research on Nephro Disease, a rare renal disorder affecting kidney function.",
            subdomain: "nephro",
            customDomain: "nephro",
            yearFounded: "2014",
            incorporationStatus: "YES",
            website: "https://www.nephro.org/",
            moneyRaised: 3000000,
            moneyDeployed: 1400000,
            researchBudget: 700000,
            interestedModalities: ["Gene Therapy", "Small Molecule Therapy"],
            diseaseName: "Nephro Disease",
            diseaseCategories: ["Renal Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 600000,
            prevalenceRatio: 1/600000,
            numberOfIdentifiedPatients: 30,
            relevantDiseaseMechanisms: ["Kidney Dysfunction"],
            associatedGenes: ["NEP1", "REN4"],
            associatedSignsAndSymptoms: ["Frequent urination", "High blood pressure"],
            existingDatabasesAndStudies: ["Nephro Natural History Study"],
            assetsUnderDevelopment: ["Kidney cell line", "Small molecule screening assays"],
            user: {
                connect: {
                    id: frank.id
                }
            },
        },
    });

    const lysogeneKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: lysogeneFoundation.id
                }
            }
        },
    })
    const neuroAidKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: neuroAidFoundation.id
                }
            }
        },
    })
    const myoparKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: myoparFoundation.id
                }
            }
        },
    })
    const cranioKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: cranioFoundation.id
                }
            }
        },
    })
    const nephroKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: nephroFoundation.id
                }
            }
        },
    })
    const arcadionKanban = await prisma.kanban.create({
        data: {
            organization: {
                connect: {
                    id: arcadion.id
                }
            }
        },
    })

// Create roadmaps for each foundation
    const lysogeneRoadmap = await createRoadmap(
        lysogeneFoundation.id, lysogeneKanban.id, exampleASORoadmap
    );
    const neuroAidRoadmap = await createRoadmap(
        neuroAidFoundation.id, neuroAidKanban.id, exampleASORoadmap
    );
    const myoparRoadmap = await createRoadmap(
        myoparFoundation.id, myoparKanban.id, exampleASORoadmap
    );
    const cranioRoadmap = await createRoadmap(
        cranioFoundation.id, cranioKanban.id, exampleASORoadmap
    );
    const nephroRoadmap = await createRoadmap(
        nephroFoundation.id, nephroKanban.id, exampleASORoadmap
    );

    // create Arcadion Disease Foundation roadmap
    const arcadionRoadmap = await createRoadmap(
        arcadion.id, arcadionKanban.id, exampleASORoadmap
    )

    console.log(arcadion)

    // await prisma.member.create({
    //     data: {
    //         role: "admin",
    //         email: "megan@comendcare.com",
    //         user: {
    //             connect: {
    //                 email: "megan@comendcare.com",
    //             },
    //         },
    //         organization: {
    //             connect: {
    //                 id: celocyn.id,
    //             }
    //         }
    //     },
    // })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "alice@prisma.io",
            user: {
                connect: {
                    email: "alice@prisma.io",
                },
            },
            organization: {
                connect: {
                    id: celocyn.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "flawnsontong1@gmail.com",
            user: {
                connect: {
                    email: "flawnsontong1@gmail.com",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "albert@comendcare.com",
            user: {
                connect: {
                    email: "albert@comendcare.com",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "betty.trevino@comendcare.com",
            user: {
                connect: {
                    email: "betty.trevino@comendcare.com",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "megan@comendcare.com",
            user: {
                connect: {
                    email: "megan@comendcare.com",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "ivan@prisma.io",
            user: {
                connect: {
                    email: "ivan@prisma.io",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await prisma.member.create({
        data: {
            role: "admin",
            email: "heidi@prisma.io",
            user: {
                connect: {
                    email: "heidi@prisma.io",
                },
            },
            organization: {
                connect: {
                    id: arcadion.id,
                }
            }
        },
    })

    await createConditions([arcadion.id, celocyn.id])
}

const exampleASORoadmap = {
    title: 'ASO Research Plan',
    description: 'By developing an ASO therapy, we aim to address the underlying genetic cause of our rare disease. Our plan outlines each stage, from identifying the target gene to advancing through clinical trials, with the goal of bringing a safe and effective treatment to patients who urgently need it.',
    milestones: [
        {
            title: 'Natural History Study',
            description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
            status: 'INPROGRESS',
            startDate: new Date(2019, 1, 1),
            papers: [],
            tasks: []
        },
        {
            title: 'Review Literature',
            description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
            status: 'DONE',
            startDate: new Date(2020, 5, 12),
            endDate: new Date(2021, 1, 3),
            papers: [],
            tasks: []
        },
        {
            title: 'Identify Existing Disease Models',
            description: 'Research and evaluate lab models.',
            status: 'INPROGRESS',
            startDate: new Date(2023, 3, 3),
            endDate: new Date(2025, 1, 1),
            papers: [],
            tasks: []
        },
        {
            title: 'Construct Mouse Models',
            description: '',
            status: 'INPROGRESS',
            startDate: new Date(2024, 5, 5),
            papers: [],
            tasks: [
                {name: 'Secure Funding', status: 'INPROGRESS'},
                {name: 'Ethical Standards Advocacy', status: 'INPROGRESS'},
                {
                    name: 'Prioritize Model Features',
                    description: 'Work with researchers to prioritize features in the model that most directly address patient needs and research goals.'
                }
            ]
        },
        {
            title: 'Construct Patient-Derived Cells',
            description: 'Work with researchers to create cell lines that replicate disease characteristics.',
            papers: [],
            startDate: new Date(2026, 1, 1),
            tasks: [
                {name: 'Coordinate Patient Participation'},
                {name: 'Secure Funding'},
                {
                    name: 'Determine Cell Model Relevancy',
                    description: 'Determine if each cell model is relevant for testing therapies and studying disease mechanisms that refect our patients real experiences.'
                }
            ]
        },
        {
            title: 'Design ASO Construct',
            description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
            startDate: new Date(2027, 1, 1),
            papers: [],
            tasks: []
        },
        {
            title: 'Produce Plasmid',
            description: 'Create a DNA template essential for developing and testing therapies.',
            startDate: new Date(2028, 1, 1),
            papers: [],
            tasks: []
        },
        {
            title: 'Proof-Of-Concept Study',
            startDate: new Date(2029, 1, 1),
            description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
            papers: [],
            tasks: []
        },
        {
            title: 'Animal Toxicology Study',
            startDate: new Date(2030, 1, 1),
            description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
            papers: [],
            tasks: []
        }
    ]
}

async function createConditions(organizationIds: string[]) {
    const celocynSyndrome = await prisma.condition.create({
        data: {
            name: "Celocyn Syndrome",
            slug: "celocyn-syndrome",
            nordURL: "https://rarediseases.org/rare-diseases/celocyn-syndrome/",
            gardURL: "https://www.ncbi.nlm.nih.gov/gard/celocyn-syndrome/",
            summary: "Celocyn Syndrome is a progressive and degenerative disorder affecting the brain, characterized by severe neurological symptoms.",
            description: "Celocyn Syndrome is a rare and devastating neurodegenerative condition that targets the brain, leading to profound and progressive neurological impairment. Patients with Celocyn Syndrome often experience a wide array of debilitating symptoms, such as severe migraines, early-onset dementia, and difficulty with motor coordination. This disorder is classified as a neuroencephalomyelopathy, highlighting its impact on both the brain and spinal cord. Research into Celocyn Syndrome remains in its early stages, with a focus on understanding the genetic underpinnings of the condition. Two genes, GEL3 and M4SF, have been associated with the disease, offering potential avenues for therapeutic intervention. Efforts to combat this disorder include the development of animal models, such as mouse models, and cellular systems to study disease mechanisms and test potential treatments. Despite its low prevalence, with only 1 case per million people and 37 identified patients globally, Celocyn Syndrome represents a significant challenge for the rare disease community, necessitating collaboration between researchers, clinicians, and advocacy groups.",
            interestedModalities: ["AAV", "ASO"],
            diseaseCategories: ["Neuroencephalomyelopathy"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 1000000,
            prevalenceRatio: 1/1000000,
            numberOfIdentifiedPatients: 37,
            relevantDiseaseMechanisms: ["Neurology"],
            associatedGenes: ["GEL3", "M4SF"],
            associatedSignsAndSymptoms: ["Severe migraines", "Early onset dementia"],
            existingDatabasesAndStudies: ["Celocyn Syndrome Registry"],
            assetsUnderDevelopment: ["Mouse model", "Cell line"],
            organizations: {
                create: {
                    organizationId: organizationIds[0]
                }
            }
        }
    });

    const arcadionDisease = await prisma.condition.create({
        data: {
            name: "Arcadion Disease",
            slug: "arcadion-disease",
            nordURL: "https://rarediseases.org/rare-diseases/arcadion-disease/",
            gardURL: "https://www.ncbi.nlm.nih.gov/gard/arcadion-disease/",
            summary: "Arcadion Disease is a progressive and degenerative disorder affecting the central nervous system, leading to severe physical and cognitive decline.",
            description: "Arcadion Disease is a rare, progressive disorder that profoundly impacts the central nervous system, causing a cascade of debilitating physical and cognitive symptoms. Patients with Arcadion Disease typically experience an insidious onset of muscle weakness, memory loss, and difficulty swallowing, all of which contribute to a significant decline in quality of life. This disease is categorized as a neurodegenerative disorder and is driven by complex mechanisms, including genetic mutations and mitochondrial dysfunction. Two genes, ARC1 and NEU4, have been implicated in the disease, providing critical insights into its pathogenesis. Ongoing research aims to develop innovative therapies, including gene therapy and CRISPR-based strategies, to halt or reverse the disease's progression. The prevalence of Arcadion Disease is estimated to be 1 in 700,000 individuals, with only 22 patients identified worldwide. Research efforts are supported by valuable resources such as the Arcadion Patient Registry and the Natural History Study, which serve to enhance our understanding of the disease trajectory. Current development efforts include a gene therapy vector and patient-derived cell lines, which represent promising tools for testing and validation. Despite its rarity, Arcadion Disease remains a focus of dedicated scientific inquiry and advocacy due to its devastating impact on affected individuals and their families.",
            interestedModalities: ["Gene Therapy", "CRISPR"],
            diseaseCategories: ["Neurodegenerative Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 700000,
            prevalenceRatio: 1/700000,
            numberOfIdentifiedPatients: 22,
            relevantDiseaseMechanisms: ["Genetic Mutation", "Mitochondrial Dysfunction"],
            associatedGenes: ["ARC1", "NEU4"],
            associatedSignsAndSymptoms: ["Muscle weakness", "Memory loss", "Difficulty swallowing"],
            existingDatabasesAndStudies: ["Arcadion Patient Registry", "Arcadion Disease Natural History Study"],
            assetsUnderDevelopment: ["Gene therapy vector", "Patient-derived cell line"],
            organizations: {
                create: {
                    organizationId: organizationIds[1]
                }
            }
        }
    });

    console.log("Conditions created:", {celocynSyndrome, arcadionDisease});
}

async function createRoadmap(organizationId: string, kanbanId: string, roadmapTemplate?: any | undefined) {
    const roadmap = await prisma.roadmap.create({
        data: {
            organization: {
                connect: {id: organizationId}
            },
            title: roadmapTemplate.title || '',
            description: roadmapTemplate.description || '',
            published: true
        }
    })

    const newColumns = await prisma.column.createMany({
        data: [
            {
                name: "To Do",
                kanbanId: kanbanId,
                kanbanPosition: 0
            },
            {
                name: "In Progress",
                kanbanId: kanbanId,
                kanbanPosition: 1
            },
            {
                name: "Done",
                kanbanId: kanbanId,
                kanbanPosition: 2
            }
        ],
        skipDuplicates: true, // Optional: Skips rows with duplicate values for unique fields
    })

    // Retrieve the created columns
    const createdColumns = await prisma.column.findMany({
        where: {
            kanbanId: kanbanId
        },
        orderBy: {
            kanbanPosition: 'asc'
        }
    });

    // if a roadmap template was provided, create the relevant nodes, milestones, and edges
    if (roadmapTemplate?.milestones) {
        const milestones = roadmapTemplate.milestones

        const nodes = await Promise.all(
            milestones.map(async (milestone: any, index: number) => {
                // create Node & associated Milestone
                const node = await prisma.node.create({
                    data: {
                        roadmapId: roadmap.id,
                        type: 'MILESTONE',
                        positionX: index * 500,
                        positionY: 0,
                        data: {
                            create: {
                                roadmapId: roadmap.id,
                                organizationId,
                                status: milestone.status || "TODO",
                                title: milestone.title,
                                ...(milestone.description ? {description: milestone.description} : undefined),
                                ...(milestone.startDate ? {startDate: milestone.startDate} : undefined),
                                ...(milestone.endDate ? {endDate: milestone.endDate} : undefined),
                                ...(milestone.budget ? {budget: milestone.budget} : undefined),
                                // ...(milestone.papers && milestone.papers.length > 0 ? { papers: milestone.papers } : undefined),
                                private: milestone.private || false
                            }
                        }
                    }
                })

                // grab milestone so we can add tasks
                // createMany doesn't support nested creates - we must add tasks after creating the Milestone object
                const newMilestone = await prisma.milestone.findUnique({
                    where: {nodeId: node.id},
                    include: {
                        papers: true, 
                        asset: {
                            include: { contacts: true, attachments: true }
                        },
                        RFP: {
                            include: { contacts: true, attachments: true }
                        },
                        tasks: true
                    }
                })

                // create tasks for relevant milestone
                if (newMilestone) {
                    await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                        await prisma.task.create({
                            data: {
                                milestoneId: newMilestone?.id,
                                status: task.status || "TODO",
                                name: task.name,
                                columnId: createdColumns[0]?.id,
                                orderPosition: index,
                                kanbanPosition: index,
                                checklist: {
                                    createMany: {
                                        data: (task.checklist || []).map((item: any, index: number) => ({
                                            name: item.name,
                                            complete: item.complete || false,
                                            orderPosition: index
                                        }))
                                    }
                                }
                            }
                        })
                    )))
                }

                return node
            })
        )

        for (let i = 0; i < nodes.length - 1; i++) {
            const edge = await prisma.edge.create({
                data: {
                    roadmap: {connect: {id: roadmap.id}},
                    source: nodes[i]?.id,
                    target: nodes[i + 1]?.id
                }
            })
        }
    }

    return roadmap
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