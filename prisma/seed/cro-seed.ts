import prisma from "@comend/lib/prisma"
import * as fs from "fs/promises";
import path from "path";

export async function seed() {
    console.log('CROs: Starting seed script...');

    // Load the JSON data
    const filePath = path.resolve(__dirname, "../../packages/data/new_dataset.json");
    const companies = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    console.log(`Total records to process: ${companies.length}`);

    let processedCount = 0;

    await prisma.company.deleteMany()
    for (const company of companies) {
        try {
            await prisma.company.create({
                data: {
                    url: company.url,
                    scientistDotComURL: company.scientistDotComURL,
                    title: company.title,
                    description: company.description,
                    yearEstablished: company.yearEstablished ? parseInt(company.yearEstablished, 10) : null,
                    website: company.website,
                    headquarters: company.headquarters,
                    companyType: company.companyType,

                    sites: {
                        create: company.sites?.map((site: any) => ({
                            name: site.name,
                            address: site.address,
                        })) || [],
                    },

                    services: {
                        connectOrCreate: company.services?.map((service: any) => ({
                            where: {
                                name: service.name,
                            },
                            create: {
                                name: service.name,
                                description: service.description,
                            },
                        })) || [],
                    },

                    certifications: {
                        connectOrCreate: company.certifications?.map((cert: any) => ({
                            where: {
                                name: cert.name,
                            },
                            create: {
                                name: cert.name,
                                files: {
                                    create: cert.files?.map((file: any) => ({
                                        fileName: file.fileName,
                                        fileUrl: file.fileUrl,
                                    })) || [],
                                },
                            },
                        })) || [],
                    },

                    simplifiedCertifications: company.simplifiedCertifications,

                    categories: company.categories,

                    milestoneTypes: company.milestoneTypes,

                    avgRating: 0,

                    rfis: {
                        create: company.rfis?.map((rfi: any) => ({
                            name: rfi.name,
                            submittedOn: rfi.submittedOn ? new Date(rfi.submittedOn) : null,
                        })) || [],
                    },
                },
            });

            processedCount++;

            // Log progress every 100 records
            if (processedCount % 100 === 0) {
                console.log(`Processed ${processedCount} records...`);
            }
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.error(`Unique constraint violation for company ${company.title}. Skipping.`);
            } else {
                console.error(`Failed to process company ${company.title}:`, error);
            }
        }
    }

    console.log(`CROs: Processed ${processedCount} records in total.`);
}

seed()
    .then(() => {
        console.log('CROs: Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('CROs: Error seeding database:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
