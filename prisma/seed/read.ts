import "dotenv/config";
import prisma from "@comend/lib/prisma";

// async function findDuplicateUsers() {
//     try {
//         const duplicates = await prisma.user.groupBy({
//             by: ["email"],
//             _count: {
//                 email: true,
//             },
//             having: {
//                 email: {
//                     _count: {
//                         gt: 1, // only emails with more than one user
//                     },
//                 },
//             },
//         });
//
//         if (duplicates.length === 0) {
//             console.log("No duplicate users found.");
//             return;
//         }
//
//         for (const dup of duplicates) {
//             const users = await prisma.user.findMany({
//                 where: { email: dup.email },
//             });
//
//             console.log(`Duplicate email: ${dup.email}`);
//             console.table(users);
//         }
//     } catch (error) {
//         console.error("Error finding duplicate users:", error);
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
// findDuplicateUsers();

async function findUsers() {
    try {
        const users = await prisma.whitelist.findMany(
            {
                select: {
                    id: true,
                    email: true,
                    emailHash: true,
                    createdAt: true
                }
            }
        )
        console.log(users)
    } catch (error) {
        console.error("Error users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

findUsers();
