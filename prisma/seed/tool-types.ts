import prisma from "@comend/lib/prisma"

import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types";

async function main() {
    console.log('Starting seed script...');

    // seed milestone types
    await prisma.toolType.deleteMany()
    const biosampleTypeIds: string[] = ['BIOMARKER', 'OUTCOMEMEASURE', 'BIOBANK', 'PATIENTDERIVEDCELLLINE', 'ENGINEEREDCELLLINE', 'MOUSEMODEL', 'OTHERDISEASEMODEL', 'TARGETVALIDATION', 'ASSAYDEVELOPMENT', 'DRUGSCREEN', 'EFFICASYSTUDY', 'DOSEFINDINGSTUDY', 'TOXICOLOGYSTUDY', 'BIODISTRIBUTIONSTUDY', 'GENETHERAPYPRODUCTION', 'GPMANUFACTURING', 'INTERACTMEETING', 'PREINDMEETING', 'INDSUBMISSION', 'SITESELECTION', 'TRIALDESIGN', 'PHASE1', 'PHASE1/2', 'PHASE2', 'PHASE3', 'FDAAPPROVAL', 'PHASE4']
    const dataTypeIds: string[] = ['BASICSCIENCE', 'FUNCTIONALSTUDY', 'NATURALHISTORYSTUDY', 'PATIENTREGISTRY', 'PATIENTRECRUITMENT']
    const toolTypes = await prisma.toolType.createMany({
        data: MILESTONE_TYPE_OPTIONS.map(({id, label}) => ({id, label, type: biosampleTypeIds.includes(id) ? 'biosample': 'data'})),
    })
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
