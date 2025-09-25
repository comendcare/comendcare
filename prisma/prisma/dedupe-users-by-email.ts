import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();

const norm = (email: string | null) =>
    (email ?? "").trim().toLowerCase();

async function main() {
    // 1) Load all users minimally (add fields you may want to merge)
    const users = await prisma.user.findMany({
        select: { id: true, email: true, createdAt: true, name: true, image: true },
    });

    // 2) Group by normalized email
    const groups = new Map<string, { id: string; createdAt: Date; name: string | null; image: string | null }[]>();
    for (const u of users) {
        const key = norm(u.email);
        if (!key) continue;
        const arr = groups.get(key) ?? [];
        arr.push(u);
        groups.set(key, arr);
    }

    // 3) Process only groups with duplicates
    for (const entry of Array.from(groups.entries())) {
        const [key, arr] = entry;
        if (arr.length < 2) continue;

        // Sort oldest first (tie-breaker by id for determinism)
        arr.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()) || a.id.localeCompare(b.id));
        const keeper = arr[0];
        const toRemove = arr.slice(1);

        console.log(`Dedup "${key}": keep ${keeper.id}, remove [${toRemove.map(x => x.id).join(", ")}]`);

        await prisma.$transaction(async (tx) => {
            // (Optional) merge profile data from duplicates into keeper if keeper’s are null
            for (const dupe of toRemove) {
                if (!keeper.name && dupe.name) {
                    await tx.user.update({ where: { id: keeper.id }, data: { name: dupe.name } });
                    keeper.name = dupe.name;
                }
                if (!keeper.image && dupe.image) {
                    await tx.user.update({ where: { id: keeper.id }, data: { image: dupe.image } });
                    keeper.image = dupe.image;
                }
            }

            // Reassign foreign keys that reference User.id (add your own tables here)
            await tx.account.updateMany({ where: { userId: { in: toRemove.map(x => x.id) } }, data: { userId: keeper.id } });
            await tx.session.updateMany({ where: { userId: { in: toRemove.map(x => x.id) } }, data: { userId: keeper.id } });

            // Examples – adjust names to your schema:
            // await tx.member.updateMany({ where: { userId: { in: toRemoveIds } }, data: { userId: keeper.id } });
            // await tx.invitation.updateMany({ where: { userId: { in: toRemoveIds } }, data: { userId: keeper.id } });
            // await tx.researcher.updateMany({ where: { userId: { in: toRemoveIds } }, data: { userId: keeper.id } });
            // etc.

            // Finally, delete the duplicate users
            await tx.user.deleteMany({ where: { id: { in: toRemove.map(x => x.id) } } });
        });
    }

    console.log("Done.");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
