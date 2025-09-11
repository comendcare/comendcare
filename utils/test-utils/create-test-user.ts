import prisma from "@comend/lib/prisma"

export async function ensureTestUser() {
    return prisma.user.upsert({
        where: { email: 'e2e+user@comend.test' },
        update: {},
        create: {
            email: 'e2e+user@comend.test',
            name: 'E2E User',
            // set any required fields for your schema
        },
    });
}
