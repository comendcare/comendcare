import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
            name: "Celocyn Synrdome Foundation",
            description: "The Celocyn Syndrome Foundation supports research and advocacy for Celocyn Syndrome, a progressive and degenerative disorder affecting the brain. Since founding in 2012 we're raised millions for the development of treatments, some of which are now in clinical trials.",
            subdomain: "celocyn",
            customDomain: "celocyn",
            dateFounded: "2012-07-14T15:23:45Z",
            incorporationStatus: "yes",
            website: "https://www.random.org/",
            moneyRaised: 5000000,
            moneyDeployed: 2000000,
            researchBudget: 1000000,
            interestedModalities: ["AAV", "ASO"],
            diseaseName: "Celocyn Syndrome",
            diseaseCategories: ["Neuroencephalomyelopathy"],
            estimatedTotalPrevalence: 200,
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
            members: {
                createMany: {
                    data: [
                        {
                            role: "admin",
                            email: "bob@prisma.io"
                        },
                        {
                            role: "admin",
                            email: "alice@prisma.io"
                        },
                    ]
                }
            },
        },
    })

    const arcadion = await prisma.organization.create({
        data: {
            name: "Arcadion Disease Foundation",
            description: "The Arcadion Disease Foundation supports research and advocacy for Arcadion Disease, a progressive and degenerative disorder affecting the central nervous system.",
            subdomain: "arcadion",
            customDomain: "arcadionfoundation",
            dateFounded: "2015-03-21T10:30:00Z",
            incorporationStatus: "yes",
            website: "https://www.example.org/",
            moneyRaised: 3200000,
            moneyDeployed: 1200000,
            researchBudget: 800000,
            interestedModalities: ["Gene Therapy", "CRISPR"],
            diseaseName: "Arcadion Disease",
            diseaseCategories: ["Neurodegenerative Disorder"],
            estimatedTotalPrevalence: 150,
            numberOfIdentifiedPatients: 22,
            relevantDiseaseMechanisms: ["Genetic Mutation", "Mitochondrial Dysfunction"],
            associatedGenes: ["ARC1", "NEU4"],
            associatedSignsAndSymptoms: ["Muscle weakness", "Memory loss", "Difficulty swallowing"],
            existingDatabasesAndStudies: ["Arcadion Patient Registry", "Arcadion Disease Natural History Study"],
            assetsUnderDevelopment: ["Gene therapy vector", "Patient-derived cell line"],
            user: {
                connect: {
                    id: alice.id
                }
            },
            members: {
                createMany: {
                    data: [
                        {
                            role: "admin",
                            email: "john.doe@example.com"
                        },
                        {
                            role: "admin",
                            email: "jane.smith@example.com"
                        },
                    ]
                }
            },
        },
    });

    console.log(arcadion)
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