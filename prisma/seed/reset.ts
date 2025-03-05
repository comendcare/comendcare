import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteCompanies() {
    try {
        console.log("Deleting all companies...");

        await prisma.company.deleteMany(); // Deletes all records from 'company' table

        console.log("All companies deleted successfully.");
    } catch (error) {
        console.error("Error deleting companies:", error);
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects properly
    }
}

deleteCompanies();
