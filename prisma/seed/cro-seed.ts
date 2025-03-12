import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed script...');

    // Load the JSON data
    const companies = JSON.parse(await fs.readFile('data/cro_dataset_categorized.json', 'utf-8'));

    console.log(`Total records to process: ${companies.length}`);

    let processedCount = 0;

    for (const company of companies) {
        // const hasValidDescription = company.description && company.description.trim() !== "";
        // const hasNonEmptyServices = Array.isArray(company.services) && company.services.length > 0;
        // const hasNonEmptySites = Array.isArray(company.sites) && company.sites.length > 0;
        // const hasNonEmptyCertifications = Array.isArray(company.certifications) && company.certifications.length > 0;
        // const hasValidWebsite = company.website && company.website.trim() !== "";
        //
        // if (!(hasValidDescription && hasNonEmptyServices && hasNonEmptySites && hasNonEmptyCertifications && hasValidWebsite)) {
        //     console.warn(`Skipping company that does not meet all validation criteria: ${company.title || 'Unknown Title'}`);
        //     continue;
        // }

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
                        create: company.services?.map((service: any) => ({
                            name: service.name,
                            description: service.description,
                        })) || [],
                    },

                    certifications: {
                        create: company.certifications?.map((cert: any) => ({
                            name: cert.name,
                            files: {
                                create: cert.files?.map((file: any) => ({
                                    fileName: file.fileName,
                                    fileUrl: file.fileUrl,
                                })) || [],
                            },
                        })) || [],
                    },

                    simplifiedCertifications: company.simplifiedCertifications,

                    categories: company.categories,

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

    console.log(`Seed script completed. Processed ${processedCount} records in total.`);
}

main()
    .then(() => {
        console.log('Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
