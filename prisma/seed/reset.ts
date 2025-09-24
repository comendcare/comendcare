import prisma from "@comend/lib/prisma"

async function deleteItems() {
    try {
        console.log("Resetting database manually...");

        await prisma.user.deleteMany(); // Deletes all records from 'company' table
        await prisma.whitelist.deleteMany(); // Deletes all records from 'company' table

        console.log("All items deleted successfully.");
    } catch (error) {
        console.error("Error deleting items:", error);
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects properly
    }
}

deleteItems();
