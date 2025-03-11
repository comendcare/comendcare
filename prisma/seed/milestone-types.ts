import {PrismaClient} from '@prisma/client';

export const MILESTONE_TYPE_OPTIONS: any[] = [
    {
        id: 'BASICSCIENCE',
        label: 'Basic science',
        services: ['Literature Searches/Reviews', 'Pathway Mapping'],
        categories: ['discovery'],
        description: 'Understand the fundamental biological processes that contribute to a disease'
    },
    {
        id: 'FUNCTIONALSTUDY',
        label: 'Functional study',
        services: ['DNA Mutagenesis', 'Mutation Data Profiling', 'SNP Characterization'],
        categories: ['discovery'],
        description: "Determine the effect of a mutation on a gene or protein’s function. This is important for identifying the disease mechanism of action."
    }, {
        id: 'NATURALHISTORYSTUDY',
        label: 'Natural history study',
        services: ['Health Economics and Outcomes Research (HEOR)', 'Non-Interventional Studies', 'Observational Research', 'Patient-Reported Outcome Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Data', 'Real-World Evidence', 'eCOA - Electronic Clinical Outcomes Assessments', 'ePRO - Electronic Patient-reported Outcome'],
        categories: ['clinical study'],
        description: 'Observe how a disease naturally progresses over time under standard of care conditions. Outcomes are usually measured by clinical researchers through formal clinical visits.'
    }, {
        id: 'PATIENTREGISTRY',
        label: 'Patient registry',
        services: ['Clinical Data Registry', 'Patient Recruitment', 'Patient-Reported Outcome Studies', 'Registries - Disease', 'Registries - Patient', 'Registries - Product'],
        categories: ['clinical study'],
        description: 'Build a systematic database of patient information to track disease progression.'
    }, {
        id: 'BIOMARKER',
        label: 'Biomarker',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Utility', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Diagnostic Biomarkers Discovery', 'Digital Biomarkers', 'Discovery Biomarker Analytics', 'Metabolomics Biomarker Discovery', 'Pharmacodynamic Biomarkers Discovery', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['discovery'],
        description: 'Identify measurable biological indicators that indicate treatment response in patients.'
    }, {
        id: 'OUTCOMEMEASURE',
        label: 'Outcome measure',
        services: ['Biomarker Analytical Validation', 'Biomarker Clinical Validation', 'Biomarker Discovery', 'Biomarker Services', 'Biomarker Services Consulting', 'Clinical Biomarker Analysis', 'Predictive Biomarkers Discovery', 'Prognostic Biomarkers Discovery', 'Translational Biomarker Discovery'],
        categories: ['clinical study'],
        description: 'Define clear criteria to judge whether a treatment is working in clinical studies.'
    }, {
        id: 'BIOBANK',
        label: 'Biobank',
        services: ['Biobanking'],
        categories: ['disease models'],
        description: 'Collect and store patient biological samples with associated clinical data securely.'
    }, {
        id: 'PATIENTDERIVEDCELLLINE',
        label: 'Patient-derived cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Human Immortalized Cell Culture', 'Human Primary Cells'],
        categories: ['disease models'],
        description: 'Grow cells taken directly from patients to study disease characteristics.'
    }, {
        id: 'ENGINEEREDCELLLINE',
        label: 'Engineered cell line',
        services: ['Cell Culture', 'Cell Line Authentication', 'Cell Line Characterization', 'Cell Line Construction', 'Gene-Edited iPSCs Disease Models', 'Human Immortalized Cell Culture', "Human iPSC's", 'Isogenic Knockout iPSC Lines'],
        categories: ['disease models'],
        description: 'Create modified cells that express or silence specific genes for research insights or models patient mutations.'
    }, {
        id: 'MOUSEMODEL',
        label: 'Mouse model',
        services: ['Knockin Mice', 'Knockout Mice', 'Sprague Dawley Rat'],
        categories: ['disease models'],
        description: 'Model genetic impacts on disease in order to understand the disease biology and the impacts of treatment on disease. '
    }, {
        id: 'OTHERDISEASEMODEL',
        label: 'Other disease model',
        services: ['3D Cell Culture', 'Animal Model Development', 'Human 3D cultures', 'Human Organoids', 'In Vitro Disease Models', 'Model Development', 'Non-Human Primate Models', 'Zebrafish Animal Model'],
        categories: ['disease models'],
        description: 'E.g. yeast, c.elegans, drosophilia, macaque, pig, dog, zebrafish, organoids, or in-silico models'
    }, {
        id: 'TARGETVALIDATION',
        label: 'Target validation',
        services: ['Target Validation', 'Target Validation Consulting'],
        categories: ['discovery'],
        description: ''
    }, {
        id: 'ASSAYDEVELOPMENT',
        label: 'Assay development',
        services: ['Assay Development', 'Assay Development Consulting', 'ELISA', 'In Vitro Assay Development', 'Metabolomics Biomarker Discovery'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'DRUGSCREEN',
        label: 'Drug screen',
        services: ['Discovery Compound Screening Analytics', 'High Throughput Screening', 'Natural Product Libraries', 'Natural Product Screening'],
        categories: ['discovery'],
        description: 'Test many compounds rapidly in a disease model to find those with promising effects against the target.'
    }, {
        id: 'EFFICASYSTUDY',
        label: 'Efficacy study',
        services: ['In Vitro Efficacy Test', 'Mouse Efficacy Monotherapy', 'Rat Efficacy Monotherapy'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'DOSEFINDINGSTUDY',
        label: 'Dose finding study',
        services: ['Dose Range Finding Study - Dog /Canine', 'Dose Range Finding Study - Mouse', 'Dose Range Finding Study - Other Species', 'Dose Range Finding Study - Rat', 'In Vitro Dose Determination Tests', 'In Vitro Toxicology Testing'],
        categories: ['preclinical'],
        description: 'Test a range of doses of the treatment to determine levels at which it has a biological effect and is safe.'
    }, {
        id: 'TOXICOLOGYSTUDY',
        label: 'Toxicology study',
        services: ['General Toxicology', 'In Vitro Toxicology Testing', 'Mammalian Toxicology', 'Toxicology Consulting'],
        categories: ['preclinical'],
        description: 'Assess potential harmful effects of a treatment in model systems before human trials.'
    }, {
        id: 'BIODISTRIBUTIONSTUDY',
        label: 'Biodistribution study',
        services: ['Drug Distribution Studies'],
        categories: ['preclinical'],
        description: ''
    }, {
        id: 'GENETHERAPYPRODUCTION',
        label: 'Gene therapy production',
        services: ['Adeno Associated Virus (AAV) Production', 'GLP Large Molecule Bioanalysis', 'Gene Synthesis', 'Gene/Oligo Synthesis', 'Oligo Synthesis', 'Plasmid DNA Preparation and Extraction', 'RNA oligo synthesis'],
        categories: ['design & manufacturing'],
        description: ''
    }, {
        id: 'GPMANUFACTURING',
        label: 'GMP manufacturing',
        services: ['Chemistry Manufacturing and Controls (CMC)', 'Chemistry Manufacturing and Controls (CMC) Consulting', 'GMP Synthesis', 'Large Scale Purification'],
        categories: ['design & manufacturing'],
        description: '(Good Manufacturing Practices)\n\nProduce clinical-grade materials under strict quality controls for human use.'
    }, {
        id: 'INTERACTMEETING',
        label: 'INTERACT meeting',
        services: [],
        categories: ['regulatory'],
        description: ''
    }, {
        id: 'PREINDMEETING',
        label: 'Pre-IND meeting',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: 'Discuss the preclinical data, manufacturing, plans for clinical testing and get feedback on the proposed clinical trial design, preclinical data, and regulatory requirements.'
    }, {
        id: 'INDSUBMISSION',
        label: 'IND submission',
        services: ['IND Enabling Package', 'IND Writing', 'IND Writing Consulting', 'Investigational Medicinal Product Dossier (IMPD) and Investigational New Drug (IND) Dossier', 'Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: 'Submit an Investigational New Drug (IND) application to begin human clinical trials.'
    }, {
        id: 'SITESELECTION',
        label: 'Site selection',
        services: ['Site Selection', 'Study/Site Feasibility Study'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'PATIENTRECRUITMENT',
        label: 'Patient recruitment',
        services: ['Clinical Trial Recruitment', 'Patient Recruitment'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'TRIALDESIGN',
        label: 'Trial design',
        services: ['Clinical Trial Consulting', 'Clinical Trial Design', 'Clinical Trial Feasibility'],
        categories: ['clinical study'],
        description: ''
    }, {
        id: 'PHASE1',
        label: 'Phase 1',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'Assess the safety of the drug, determine a safe dose, identify side effects, and study the pharmacological characteristics of the drug in humans'
    }, {
        id: 'PHASE1/2',
        label: 'Phase 1/2',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'A combination of the first two phases of clinical testing, designed to evaluate both the safety and efficacy of a drug in a single trial.'
    }, {
        id: 'PHASE2',
        label: 'Phase 2',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: 'Assess whether the drug works as intended and to monitor its side effects in a larger, disease-affected population'
    }, {
        id: 'PHASE3',
        label: 'Phase 3',
        services: ['Phase 1-3 Studies'],
        categories: ['clinical study'],
        description: "Confirm the drug's efficacy, monitor side effects in a larger population, and compare it to current standard treatments."
    }, {
        id: 'FDAAPPROVAL',
        label: 'FDA approval',
        services: ['Regulatory Starting Materials'],
        categories: ['regulatory'],
        description: ''
    }, {
        id: 'PHASE4',
        label: 'Phase 4',
        services: ['Biomarker Services', 'Clinical Data Registry', 'Patient-Reported Outcome Studies', 'Post-Marketing (Phase 4) Studies', 'RWE/HEOR Data Analysis', 'RWE/HEOR/Market Access Data Analytics', 'Real World Evidence (RWE) Studies', 'Real-World Evidence'],
        categories: ['clinical study'],
        description: 'Occurs after FDA approval to monitor long-term effects and rare side effects that may not have appeared in earlier phases.'
    }
];

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed script...');

    // seed milestone types
    await prisma.milestoneType.deleteMany()
    const milestoneTypes = await prisma.milestoneType.createMany({
        data: MILESTONE_TYPE_OPTIONS
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
