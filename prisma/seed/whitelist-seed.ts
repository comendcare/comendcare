import prisma from "@/lib/prisma"

async function main() {
    const envVar = process.env.USER_WHITELIST;
    if (!envVar) {
        console.warn("⚠️ No USER_WHITELIST env var found.");
        return;
    }

    const emails = envVar.split(',').map(email => email.trim()).filter(Boolean);

    for (const email of emails) {
        await prisma.whitelist.upsert({
            where: { email },
            update: {},
            create: { email },
        });
    }

    console.log(`✅ Seeded ${emails.length} whitelisted emails.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
