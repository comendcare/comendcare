// This seed script is meant to help during development, and not to be used to seed production databases
import {Organization, PrismaClient} from '@prisma/client'
import { organizations } from '@/data/sample-pags';
import { sleep } from '@/lib/utils';

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

    const arcadion = await prisma.organization.create({
        data: {
            name: "Arcadion Disease Foundation",
            description: "The Arcadion Disease Foundation supports research and advocacy for Arcadion Disease, a progressive and degenerative disorder affecting the central nervous system.",
            subdomain: "arcadion",
            customDomain: "arcadion",
            yearFounded: "2015",
            incorporationStatus: "YES",
            website: "https://www.example.org/",
            moneyRaised: 3200000,
            moneyDeployed: 1200000,
            researchBudget: 800000,
            user: {
                connect: {
                    id: flawnson.id
                }
            },
        },
    });

    try {
        await Promise.all(
            organizations.map(async (org: any) => {
                // Create the organization in the database
                const createdOrg = await prisma.organization.create({
                    data: {
                        ...org, // Spread the data from the imported array
                    },
                });
            })
        );
        console.log('All organizations created successfully!');
    } catch (error) {
        console.error('Error creating organizations and roadmaps:', error);
    }

    // create Arcadion Disease Foundation roadmap
    const arcadionRoadmap = await createRoadmap(arcadion.id, exampleASORoadmap)

    console.log(arcadion)

    // await prisma.member.create({
    //     data: {
    //         role: "owner",
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
            role: "owner",
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
            role: "owner",
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
            role: "owner",
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
            role: "owner",
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
            role: "owner",
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
            role: "owner",
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

    // await createConditions([arcadion.id])
}

const exampleASORoadmap = {
    title: 'ASO Research Plan',
    description: 'By developing an ASO therapy, we aim to address the underlying genetic cause of our rare disease. Our plan outlines each stage, from identifying the target gene to advancing through clinical trials, with the goal of bringing a safe and effective treatment to patients who urgently need it.',
    milestones: [
        {
            title: 'Natural History Study',
            description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
            types: ['NATURALHISTORYSTUDY'],
            startDate: new Date(2019, 1, 1),
            attachments: [],
            tasks: []
        },
        {
            title: 'Literature Review',
            description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
            types: ['LITERATUREREVIEW'],
            startDate: new Date(2020, 5, 12),
            endDate: new Date(2021, 1, 3),
            attachments: [],
            tasks: []
        },
        {
            title: 'Identify Existing Disease Models',
            description: 'Research and evaluate lab models.',
            startDate: new Date(2023, 3, 3),
            endDate: new Date(2025, 1, 1),
            attachments: [],
            tasks: []
        },
        {
            title: 'Construct Mouse Models',
            description: '',
            types: ['MOUSEMODEL'],
            startDate: new Date(2024, 5, 5),
            attachments: [],
            tasks: []
        },
        {
            title: 'Construct Patient-Derived Cells',
            description: 'Work with researchers to create cell lines that replicate disease characteristics.',
            types: ['CELLLINE'],
            attachments: [],
            startDate: new Date(2026, 1, 1),
            tasks: []
        },
        {
            title: 'Design ASO Construct',
            description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
            types: ['CONSTRUCTDESIGN'],
            startDate: new Date(2027, 1, 1),
            attachments: [],
            tasks: []
        },
        {
            title: 'Produce Plasmid',
            description: 'Create a DNA template essential for developing and testing therapies.',
            types: ['PLASMIDPRODUCTION'],
            startDate: new Date(2028, 1, 1),
            attachments: [],
            tasks: []
        },
        {
            title: 'Proof-Of-Concept Study',
            startDate: new Date(2029, 1, 1),
            description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
            types: ['PROOFOFCONCEPT'],
            attachments: [],
            tasks: []
        },
        {
            title: 'Animal Toxicology Study',
            startDate: new Date(2030, 1, 1),
            description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
            types: ['TOXICOLOGY'],
            attachments: [],
            tasks: []
        }
    ]
}

async function createConditions(organizationIds: string[]) {
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
            numberOfPatientsEngaged: 22,
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

    console.log("Conditions created:", {arcadionDisease});
}

async function createRoadmap(organizationId: string, roadmapTemplate?: any | undefined) {
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

    // if a roadmap template was provided, create the relevant nodes, milestones, and edges
    if (roadmapTemplate?.milestones) {
        const milestones = roadmapTemplate.milestones

        const nodes = await Promise.all(
            milestones.map(async (milestone: any, index: number) => {
                // create Node & associated Milestone
                const node = await prisma.node.create({
                    data: {
                        roadmapId: roadmap.id,
                        type: 'PROJECT',
                        positionX: index * 500,
                        positionY: 0,
                        data: {
                            create: {
                                roadmapId: roadmap.id,
                                organizationId,
                                types: milestone.types || [],
                                status: milestone.status || "PLANNED",
                                title: milestone.title,
                                ...(milestone.description ? {description: milestone.description} : undefined),
                                ...(milestone.startDate ? {startDate: milestone.startDate} : undefined),
                                ...(milestone.endDate ? {endDate: milestone.endDate} : undefined),
                                ...(milestone.budget ? {budget: milestone.budget} : undefined),
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
                        attachments: true, 
                        // asset: {
                        //     include: { contacts: true, attachments: true }
                        // },
                        // RFP: {
                        //     include: { contacts: true, attachments: true }
                        // },
                        tasks: true,
                        node: true
                    }
                })

                // // create tasks for relevant milestone
                // if (newMilestone) {
                //     await Promise.all((milestone.tasks || []).map(async (task: any, index: number) => (
                //         await prisma.task.create({
                //             data: {
                //                 milestoneId: newMilestone?.id,
                //                 status: task.status || "TODO",
                //                 name: task.name,
                //                 orderPosition: index,
                //                 kanbanPosition: index,
                //                 checklist: {
                //                     createMany: {
                //                         data: (task.checklist || []).map((item: any, index: number) => ({
                //                             name: item.name,
                //                             complete: item.complete || false,
                //                             orderPosition: index
                //                         }))
                //                     }
                //                 }
                //             }
                //         })
                //     )))
                // }

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
