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

    // const megan = await prisma.user.upsert({
    //     where: { email: 'megan@comendcare.com' },
    //     update: {},
    //     create: { 
    //         email: 'megan@comendcare.com',
    //         name: 'Megan McClure'
    //     }
    // })

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
            description: "The Celocyn Syndrome Foundation supports research and advocacy for Celocyn Syndrome, a progressive and degenerative disorder affecting the brain. Since founding in 2012 we're raised millions for the development of treatments, some of which are now in clinical trials.",
            subdomain: "celocyn",
            customDomain: "celocyn",
            dateFounded: "2012-07-14T15:23:45Z",
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

    // create Celocyn Syndrome Foundation Roadmap
    const celocynRoadmap = await createRoadmap(celocyn.id, exampleASORoadmap)

    const arcadion = await prisma.organization.create({
        data: {
            name: "Arcadion Disease Foundation",
            description: "The Arcadion Disease Foundation supports research and advocacy for Arcadion Disease, a progressive and degenerative disorder affecting the central nervous system.",
            subdomain: "arcadion",
            customDomain: "arcadionfoundation",
            dateFounded: "2015-03-21T10:30:00Z",
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

    // create Arcadion Disease Foundation roadmap
    const arcadionRoadmap = await createRoadmap(arcadion.id, exampleASORoadmap)

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
    //                 id: arcadion.id,
    //             }
    //         }
    //     },
    // })

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

    await createConditions()

}

const exampleASORoadmap = {
    title: 'ASO Roadmap',
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
                { name: 'Secure Funding', status: 'INPROGRESS' },
                { name: 'Ethical Standards Advocacy', status: 'INPROGRESS' },
                { name: 'Prioritize Model Features', description: 'Work with researchers to prioritize features in the model that most directly address patient needs and research goals.' }
            ]
        },
        {
            title: 'Construct Patient-Derived Cells',
            description: 'Work with researchers to create cell lines that replicate disease characteristics.',
            papers: [],
            startDate: new Date(2026, 1, 1),
            tasks: [
                { name: 'Coordinate Patient Participation' },
                { name: 'Secure Funding' },
                { name: 'Determine Cell Model Relevancy', description: 'Determine if each cell model is relevant for testing therapies and studying disease mechanisms that refect our patients real experiences.'}
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

async function createConditions() {
    const celocynSyndrome = await prisma.condition.create({
        data: {
            name: "Celocyn Syndrome",
            slug: "celocyn-syndrome",
            nordURL: "https://rarediseases.org/rare-diseases/celocyn-syndrome/",
            gardURL: "https://www.ncbi.nlm.nih.gov/gard/celocyn-syndrome/",
            description: "Celocyn Syndrome is a progressive and degenerative disorder affecting the brain, characterized by severe neurological symptoms.",
            interestedModalities: ["AAV", "ASO"],
            diseaseCategories: ["Neuroencephalomyelopathy"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 1000000,
            numberOfIdentifiedPatients: 37,
            relevantDiseaseMechanisms: ["Neurology"],
            associatedGenes: ["GEL3", "M4SF"],
            associatedSignsAndSymptoms: ["Severe migraines", "Early onset dementia"],
            existingDatabasesAndStudies: ["Celocyn Syndrome Registry"],
            assetsUnderDevelopment: ["Mouse model", "Cell line"]
        }
    });

    const arcadionDisease = await prisma.condition.create({
        data: {
            name: "Arcadion Disease",
            slug: "arcadion-disease",
            nordURL: "https://rarediseases.org/rare-diseases/arcadion-disease/",
            gardURL: "https://www.ncbi.nlm.nih.gov/gard/arcadion-disease/",
            description: "Arcadion Disease is a progressive and degenerative disorder affecting the central nervous system, leading to severe physical and cognitive decline.",
            interestedModalities: ["Gene Therapy", "CRISPR"],
            diseaseCategories: ["Neurodegenerative Disorder"],
            prevalenceNumerator: 1,
            prevalenceDenominator: 700000,
            numberOfIdentifiedPatients: 22,
            relevantDiseaseMechanisms: ["Genetic Mutation", "Mitochondrial Dysfunction"],
            associatedGenes: ["ARC1", "NEU4"],
            associatedSignsAndSymptoms: ["Muscle weakness", "Memory loss", "Difficulty swallowing"],
            existingDatabasesAndStudies: ["Arcadion Patient Registry", "Arcadion Disease Natural History Study"],
            assetsUnderDevelopment: ["Gene therapy vector", "Patient-derived cell line"]
        }
    });

    console.log("Conditions created:", { celocynSyndrome, arcadionDisease });
}

async function createRoadmap(organizationId: string, roadmapTemplate?: any | undefined) {
    const roadmap = await prisma.roadmap.create({
        data: {
            organization: {
                connect: { id: organizationId }
            },
            title: roadmapTemplate.title || '',
            description: roadmapTemplate.description || '',
            published: true
        }
    })

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
                                status: milestone.status || "TODO",
                                title: milestone.title,
                                ...(milestone.description ? { description: milestone.description } : undefined),
                                ...(milestone.startDate ? { startDate: milestone.startDate } : undefined),
                                ...(milestone.endDate ? { endDate: milestone.endDate } : undefined),
                                ...(milestone.budget ? { budget: milestone.budget } : undefined),
                                papers: milestone.papers || [],
                                private: milestone.private || false
                            }
                        }
                    }
                })

                // grab milestone so we can add tasks
                // createMany doesn't support nested creates - we must add tasks after creating the Milestone object
                const newMilestone = await prisma.milestone.findUnique({
                    where: { nodeId: node.id },
                    include: { tasks: true }
                })

                // create tasks for relevant milestone
                if (newMilestone) {
                    await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                        await prisma.task.create({
                            data: {
                                milestoneId: newMilestone?.id,
                                status: task.status || "TODO",
                                name: task.name,
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

        for (let i = 0; i < nodes.length-1; i++) {
            const edge = await prisma.edge.create({
                data: {
                    roadmap: { connect: { id: roadmap.id } },
                    source: nodes[i]?.id,
                    target: nodes[i+1]?.id
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