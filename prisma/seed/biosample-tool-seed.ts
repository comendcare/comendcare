import {createReadStream} from "fs";
import * as readline from "readline";
import prisma from "@comend/lib/prisma";
import {withOrganizationAuth} from "packages/lib/auth";
import {Organization} from "@prisma/client";
import {InputJsonObject} from "@prisma/client/runtime/library";
import {customAlphabet} from "nanoid";

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7
) // 7-character random string

const createOrUpdateAsset = async (
    organization: Organization,
    toolData: any,
    biosampleData?: any,
    donorData?: any
) => {
    try {
        // console.log(`biosample data`, biosampleData)
        // console.log(`donor data`, donorData)
        if (!organization.id) {
            throw new Error("No organization id provided.")
        }

        const response = await prisma.tool.upsert({
            where: {
                id: toolData.id || nanoid()
            },
            include: {
                contacts: true,
                attachments: true,
                milestones: {
                    include: {
                        milestone: {
                            include: {types: {include: {milestoneType: true}}}
                        }
                    }
                },
                biosample: true
            },
            update: {
                title: toolData.title,
                description: toolData.description,
                types: toolData.types,
                ...(toolData.attachments ? (
                    {
                        attachments: {
                            deleteMany: {}, // clear all existing attachments
                            createMany: {
                                data: (toolData?.attachments || []).map((attachment: any) => ({
                                    link: attachment.link,
                                    ...(attachment.name ? {name: attachment.name} : undefined)
                                }))
                            }
                        }
                    }
                ) : undefined),
                ...(toolData.contacts ? (
                    {
                        contacts: {
                            deleteMany: {},
                            createMany: {
                                data: (toolData?.contacts || []).map((contact: any) => ({
                                    name: contact.name,
                                    email: contact.email,
                                    ...(contact.role ? {role: contact.role} : undefined),
                                    ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                                }))
                            }
                        }
                    }
                ) : undefined),
                ...(toolData.milestones ? (
                    {
                        milestones: {
                            deleteMany: {},
                            create: (toolData.milestones || []).map((milestone: any) => ({
                                milestone: {
                                    connect: {id: milestone.milestoneId}
                                }
                            }))
                        },
                    }
                ) : undefined),
                private: toolData.private || false,
                metadata: toolData.metadata as InputJsonObject,
                biosample: {
                    upsert: {
                        update: {
                            ...toolData?.biosample,
                            donor: {
                                upsert: {
                                    update: {...toolData?.biosample?.donor},
                                    create: {...toolData?.biosample?.donor}
                                }
                            }
                        },
                        create: {
                            ...toolData?.biosample,
                            donor: {
                                create: {...toolData?.biosample?.donor}
                            }
                        }
                    }
                }
            },
            create: {
                // create with the given id if it's available. This is useful for situations like 'undo'
                // where we're re-creating a pre-existing tool, and the id should match the id in our zustand state
                ...(toolData.id ? {id: toolData.id} : undefined),
                title: toolData.title || "",
                description: toolData.description,
                types: toolData.types,
                attachments: {
                    createMany: {
                        data: (toolData?.attachments || []).map((attachment: any) => ({
                            link: attachment.link,
                            ...(attachment.name ? {name: attachment.name} : undefined)
                        }))
                    }
                },
                contacts: {
                    createMany: {
                        data: (toolData?.contacts || []).map((contact: any) => ({
                            name: contact.name,
                            email: contact.email,
                            ...(contact.role ? {role: contact.role} : undefined),
                            ...(contact.affiliation ? {affiliation: contact.affiliation} : undefined)
                        }))
                    }
                },
                milestones: {
                    create: (toolData.milestones || []).map((milestone: any) => ({
                        milestone: {
                            connect: {id: milestone.milestoneId}
                        }
                    }))
                },
                private: toolData.private || false,
                organization: {connect: {id: organization.id}},
                metadata: toolData.metadata as InputJsonObject,
                biosample: {
                    create: {
                        ...toolData?.biosample,
                        donor: {
                            create: {...toolData?.biosample?.donor}
                        }
                    }
                }
            },
        })

        return response
    } catch (error: any) {
        console.error("Error creating or updating tool:", error.message);
        throw new Error(error.message || "Failed to create or update tool.");
    }
}

async function main() {
    console.log("Seeding biosample tools through `createOrUpdateAsset`...");

    const organization = await prisma.organization.findFirst();
    if (!organization) throw new Error("No organization found.");

    const fileStream = createReadStream("./packages/data/deduped_aminochain_all_data.jsonl");

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let processed = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;

        let record;
        try {
            record = JSON.parse(line);
        } catch (err) {
            console.warn("Skipping invalid JSON line:", line);
            continue;
        }

        const biosample = {
            // type: record.specimen_type || "Unknown",
            biosampleDiagnosis: (record.diagnoses || record.donor_diagnoses || []).join(", "),
            // institution: record.institution_name || "Unknown",
            pathology: record.pathology || "",
            preservationMethod: record.preservation_method || "Unknown",
            // preservation: record.raw_preservation || "",
            // donorAge: record.age_at_collection,
            // donorSex: record.sex || "Unknown",
            clinicalData: record.clinical_data || "",
            countryOfCollection: record.country_of_origin || "Unknown",
            // donorRace: record.omb_race || record.donor_race || "Unknown",
            // treatments: (record.treatments || record.donor_treatments || []).join(", "),
            // pmi: "",
            volume: null,
            mass: null,
            area: null,
            donor: {
                age: record.age_at_collection,
                sex: record.sex || "Unknown",
                race: record.omb_race || record.donor_race || "Unknown",
                // clinicalData: record.clinical_data || "",
                // country: record.country_of_origin || "Unknown",
                // treatments: (record.treatments || record.donor_treatments || []).join(", "),
            },
        };

        const toolData = {
            title: `Imported Specimen ${record.specimen_id}`,
            description: `Auto-imported specimen from ${record.source_site || "Unknown site"}`,
            types: ["biosample"],
            metadata: {source: "import-script", specimenId: record.specimen_id},
            attachments: [],
            contacts: [],
            milestones: [],
            private: false,
            biosample,
        };

        try {
            await createOrUpdateAsset(organization, toolData);
            processed++;
            if (processed % 10 === 0) console.log(`Inserted ${processed} biosample tools...`);
        } catch (err: any) {
            console.error(`Failed to insert record ${record.specimen_id}:`, err.message);
        }
    }

    console.log(`Done seeding biosample tools. Total inserted: ${processed}`);
}

main()
    .then(() => console.log("Seeding complete."))
    .catch((err) => console.error("Seeding error:", err));
