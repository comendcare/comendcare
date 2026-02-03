import prisma from "@comend/lib/prisma";

async function whitelistEmails(emails: (string | null)[]) {
    if (!emails?.length) return;

    // De-dupe + strip empties just in case
    const unique = Array.from(new Set(emails.filter(email => email !== null)));

    await prisma.whitelist.createMany({
        data: unique.map((email) => ({ email })),
        skipDuplicates: true, // <- avoids errors if already whitelisted
    });
}

export async function seed() {
    console.log("Users: Starting institution seed script...");

    const users = await Promise.all([
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

    return users
}

seed()
    .then(() => {
        console.log("Users: Seeding finished successfully!");
    })
    .catch((err) => {
        console.error("Users: Error during seeding:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });