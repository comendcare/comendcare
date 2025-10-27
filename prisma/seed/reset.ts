import 'dotenv/config';
import prisma from "@comend/lib/prisma"

async function deleteItems() {
    try {
        console.log("Resetting database manually...");

        await prisma.company.deleteMany();

        console.log("All items deleted successfully.");
    } catch (error) {
        console.error("Error deleting items:", error);
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects properly
    }
}

deleteItems();
