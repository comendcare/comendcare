"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createCondition, updateOrganization} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Slider} from "@/components/ui/slider";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FaQuestionCircle} from "react-icons/fa";
import {CalendarDays, Timer} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FaUserPlus, FaUsersViewfinder} from "react-icons/fa6";
import {Badge} from "@/components/ui/badge";
import React, {useState} from "react";
import {faker} from "@faker-js/faker";
import LoadingDots from "@/components/icons/loading-dots";

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const researchOnboardingFormSchema = z.object({
    disorder: z.string()
        .min(2, {
            message: "The name of your condition needs to be longer than 2 characters",
        })
        .max(60, {
            message: "The name of your condition needs to be shorter than 60 characters",
        })
        .optional(),
    summary: z.string()
        .min(30, {
            message: "The summary of your condition needs to be longer than 30 characters",
        })
        .max(500, {
            message: "The name of your condition needs to be shorter than 500 characters",
        })
        .optional(),
    modalities: z.array(optionSchema).min(0).optional(),
    categories: z.array(optionSchema).optional(),
    prevalenceNumerator: z.string().min(1, {
        message: "Your organization's prevalence.",
    }).optional(),
    prevalenceDenominator: z.string().min(1, {
        message: "Your organization's prevalence.",
    }).optional(),
    population: z.string().min(1, {
        message: "Your organization's description.",
    }).optional(),
    // mechanisms: z.array(optionSchema).min(0),
    mechanisms: z.array(z.string()).optional(),
    genes: z.array(optionSchema).optional(),
    biomarkers: z.array(optionSchema).optional(),
    systems: z.array(optionSchema).optional(),
    symptoms: z.array(optionSchema).optional(),
    studies: z.array(optionSchema).optional(),
    assets: z.array(optionSchema).optional(),
})

export const CONDITION_MECHANISM_OPTIONS: Option[] = [
    {
        // id: 'autosomal-dominant',
        label: 'Autosomal dominant',
        value: 'autosomal-dominant',
        group: 'Genetics',
        subgroup: 'Inheritance'
    },
    {
        // id: 'autosomal-recessive',
        label: 'Autosomal recessive',
        value: 'autosomal-recessive',
        group: 'Genetics',
        subgroup: 'Inheritance'
    },
    {
        // id: 'x-linked',
        label: 'X-linked',
        value: 'x-linked',
        group: 'Genetics',
        subgroup: 'Inheritance'
    },
    {
        // id: 'y-linked',
        label: 'Y-linked',
        value: 'y-linked',
        group: 'Genetics',
        subgroup: 'Inheritance'
    },
    {
        // id: 'mitochondrial',
        label: 'Mitochondrial',
        value: 'mitochondrial',
        group: 'Genetics',
        subgroup: 'Inheritance'
    },
    {
        // id: 'missense',
        label: 'Missense',
        value: 'missense',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'nonsense',
        label: 'Nonsense',
        value: 'nonsense',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'frameshift',
        label: 'Frameshift',
        value: 'frameshift',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'insertion-or-deletion',
        label: 'Insertion or deletion',
        value: 'insertion-or-deletion',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'copy-number-variations',
        label: 'Copy number variations',
        value: 'copy-number-variations',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'splice-site-mutation',
        label: 'Splice-site mutation',
        value: 'splice-site-mutation',
        group: 'Genetics',
        subgroup: 'Molecular nature'
    },
    {
        // id: 'chromosomal-anomaly',
        label: 'Chromosomal anomaly',
        value: 'chromosomal-anomaly',
        group: 'Genetics',
        subgroup: 'Chromosomal anomaly'
    },
    {
        // id: 'epigenetic',
        label: 'Epigenetic',
        value: 'epigenetic',
        group: 'Genetics',
        subgroup: 'Epigenetic'
    },
    {
        // id: 'loss-of-function',
        label: 'Loss-of-function',
        value: 'loss-of-function',
        group: 'Genetics',
        subgroup: 'Functional impact'
    },
    {
        // id: 'gain-of-function',
        label: 'Gain-of-function',
        value: 'gain-of-function',
        group: 'Genetics',
        subgroup: 'Functional impact'
    },
]

export const SYSTEMS_AFFECTED_OPTIONS: Option[] = [
    {
        label: 'Neurological',
        value: 'neurological',
    },
    {
        label: 'Musculoskeletal',
        value: 'musculoskeletal',
    },
    {
        label: 'Cardiovascular',
        value: 'cardiovascular',
    },
    {
        label: 'Respiratory',
        value: 'respiratory',
    },
    {
        label: 'Renal and urological',
        value: 'renal-and-urological',
    },
    {
        label: 'Dermatological',
        value: 'dermatological',
    },
    {
        label: 'Endocrine and metabolic',
        value: 'endocrine-and-metabolic',
    },
    {
        label: 'Hematological',
        value: 'hematological',
    },
    {
        label: 'Immune',
        value: 'immune',
    },
]

export const MODALITIES_OF_INTEREST_OPTIONS: Option[] = [
    {
        label: 'Gene replacement',
        value: 'Gene replacement',
        group: 'Genetic',
    },
    {
        label: 'CRISPR',
        value: 'CRISPR',
        group: 'Genetic',
    },
    {
        label: 'Base editing',
        value: 'Base editing',
        group: 'Genetic',
    },
    {
        label: 'Prime editing',
        value: 'Prime editing',
        group: 'Genetic',
    },
    {
        label: 'ASO',
        value: 'ASO',
        group: 'Genetic',
    },
    {
        label: 'RNAi',
        value: 'RNAi',
        group: 'Genetic',
    },
    {
        label: 'Enzyme replacement',
        value: 'Enzyme replacement',
        group: 'Protein-based',
    },
    {
        label: 'Drug repurposing',
        value: 'Drug repurposing',
        group: 'Small-molecule',
    },
    {
        label: 'Pathway modulators',
        value: 'Pathway modulators',
        group: 'Small-molecule',
    },
    {
        label: 'Stem cells',
        value: 'Stem cells',
        group: 'Cell-based',
    },
    {
        label: 'Nanoparticles',
        value: 'Nanoparticles',
        group: 'Delivery systems',
    },
    {
        label: 'Viral vectors',
        value: 'Viral vectors',
        group: 'Delivery systems',
    },
]

export const MILESTONE_STATUS_OPTIONS: string[] = [
    'Planned',
    'Fundraising',
    'RFP',
    'In-progress',
    'Completed',
]

export const MILESTONE_OUTCOME_OPTIONS: string[] = [
    'Publication',
    'Asset',
    'Data',
    'Decision',
]

export const MODALITIES: Option[] = [
    {
        id: '1',
        label: 'Gene Therapy (AAV)',
        value: 'GENE_THERAPY_AAV',
        description: 'A therapeutic approach using adeno-associated viruses (AAV) to deliver genetic material into cells, often to correct or replace defective genes.',
        strengths: 'High precision in targeting specific cells, long-term expression of therapeutic genes, and growing clinical success in various diseases.',
    },
    {
        id: '2',
        label: 'Gene Editing',
        value: 'GENE_EDITING',
        description: 'A technology for directly altering the DNA of an organism, including techniques like CRISPR/Cas9 to modify genes for therapeutic purposes.',
        strengths: 'Highly versatile, precise gene modifications, and potential for permanent therapeutic outcomes.',
    },
    {
        id: '3',
        label: 'Antisense Oligonucleotide (ASO)',
        value: 'ANTISENSE_OLIGONUCLEOTIDE',
        description: 'Short, synthetic strands of DNA or RNA designed to bind to specific mRNA sequences, modifying gene expression or protein production.',
        strengths: 'Targets specific genes, reversible effects, and customizable for various genetic disorders.',
    },
    {
        id: '4',
        label: 'Other RNA Therapy',
        value: 'OTHER_RNA_THERAPY',
        description: 'A broad category of therapies leveraging RNA molecules, such as RNA interference (RNAi) and mRNA vaccines, to modulate gene expression or induce immune responses.',
        strengths: 'Rapid development timelines, adaptable to different diseases, and avoids permanent DNA alterations.',
    },
    {
        id: '5',
        label: 'Enzyme Replacement',
        value: 'ENZYME_REPLACEMENT',
        description: 'A treatment approach involving the administration of exogenous enzymes to replace deficient or malfunctioning enzymes in patients.',
        strengths: 'Addresses underlying enzyme deficiencies, well-established for several metabolic disorders, and provides symptomatic relief.',
    },
    {
        id: '6',
        label: 'Drug Repurposing or Drug Screening',
        value: 'DRUG_REPURPOSING_SCREENING',
        description: 'Strategies to identify new therapeutic uses for existing drugs or discover novel compounds for specific diseases through systematic screening.',
        strengths: 'Reduces development timelines, leverages existing safety profiles, and cost-effective compared to de novo drug development.',
    },
    {
        id: '7',
        label: 'Pathway Modulators',
        value: 'PATHWAY_MODULATORS',
        description: 'Therapies designed to target and modulate biological pathways involved in disease processes, such as signaling cascades and metabolic pathways.',
        strengths: 'Addresses disease mechanisms at a systemic level, potential for broad applications, and integrates well with other therapeutic modalities.',
    },
    {
        id: '8',
        label: 'Antibodies',
        value: 'ANTIBODIES',
        description: 'Biologics that use engineered or natural antibodies to target specific proteins or antigens for therapeutic purposes.',
        strengths: 'Highly specific targeting, strong efficacy in immune-related diseases, and a proven track record in therapy.',
    },
    {
        id: '9',
        label: 'Vaccine',
        value: 'VACCINE',
        description: 'Biological preparations that provide immunity to specific diseases, often by stimulating the immune system to recognize and combat pathogens.',
        strengths: 'Prevents disease proactively, adaptable to various pathogens, and scalable for public health impact.',
    },
    {
        id: '10',
        label: 'Novel Chemistry',
        value: 'NOVEL_CHEMISTRY',
        description: 'Innovative small molecule drugs designed using advanced chemical techniques to target unique mechanisms of action.',
        strengths: 'Highly customizable for specific targets, scalable production, and potential for oral administration.',
    },
    {
        id: '11',
        label: 'Stem Cell Transplant',
        value: 'STEM_CELL_TRANSPLANT',
        description: 'The use of stem cells to regenerate or repair damaged tissues and treat conditions like hematological diseases and genetic disorders.',
        strengths: 'Potential for long-term regeneration, versatile applications, and addresses root causes of diseases.',
    },
    {
        id: '12',
        label: 'Other',
        value: 'OTHER',
        description: 'Any additional or emerging therapeutic approaches not covered in the predefined categories.',
        strengths: 'Flexibility to incorporate novel, interdisciplinary methods and adaptability to unique challenges.',
    },
];

export const ASSOCIATED_SYSTEMS: Option[] = [
    {
        id: '1',
        label: 'Neuro',
        value: 'NEURO',
        description: 'Associated with neurological systems, including the brain, spinal cord, and peripheral nerves.',
        strengths: 'Focuses on diseases and conditions affecting neural pathways and cognitive functions.',
    },
    {
        id: '2',
        label: 'Musculoskeletal',
        value: 'MUSCULOSKELETAL',
        description: 'Pertains to the musculoskeletal system, including bones, muscles, and connective tissues.',
        strengths: 'Addresses conditions like degenerative diseases, structural defects, and mobility impairments.',
    },
    {
        id: '3',
        label: 'Hepatic',
        value: 'HEPATIC',
        description: 'Relates to the liver and its associated functions in metabolism and detoxification.',
        strengths: 'Targets liver-specific conditions and systemic metabolic disorders.',
    },
    {
        id: '4',
        label: 'Cardiovascular',
        value: 'CARDIOVASCULAR',
        description: 'Concerns the heart and blood vessels, including circulatory system-related disorders.',
        strengths: 'Focuses on cardiovascular health, blood flow optimization, and structural heart issues.',
    },
    {
        id: '5',
        label: 'Respiratory',
        value: 'RESPIRATORY',
        description: 'Involves the lungs and respiratory pathways, addressing diseases affecting breathing and oxygen exchange.',
        strengths: 'Targets conditions such as asthma, fibrosis, and respiratory infections.',
    },
    {
        id: '6',
        label: 'Urological',
        value: 'UROLOGICAL',
        description: 'Pertains to the urinary system, including kidneys, ureters, bladder, and urethra.',
        strengths: 'Addresses urological disorders like renal diseases and urinary tract issues.',
    },
    {
        id: '7',
        label: 'Dermatological',
        value: 'DERMATOLOGICAL',
        description: 'Relates to the skin, hair, and nails, including various dermatological diseases and conditions.',
        strengths: 'Targets skin-related issues, including genetic disorders and immune-mediated skin diseases.',
    },
    {
        id: '8',
        label: 'Endocrine',
        value: 'ENDOCRINE',
        description: 'Concerns the endocrine system, including glands that regulate hormones.',
        strengths: 'Focuses on hormonal imbalances, glandular disorders, and metabolic dysfunction.',
    },
    {
        id: '9',
        label: 'Metabolic',
        value: 'METABOLIC',
        description: 'Involves metabolic pathways and disorders, such as enzyme deficiencies and inborn errors of metabolism.',
        strengths: 'Addresses systemic metabolic dysfunctions and energy production issues.',
    },
    {
        id: '10',
        label: 'Hematological',
        value: 'HEMATOLOGICAL',
        description: 'Pertains to blood and its components, including red cells, white cells, platelets, and plasma.',
        strengths: 'Targets conditions like anemias, clotting disorders, and blood cancers.',
    },
    {
        id: '11',
        label: 'Immune',
        value: 'IMMUNE',
        description: 'Relates to the immune system, focusing on disorders like immunodeficiency, autoimmunity, and hypersensitivities.',
        strengths: 'Addresses immune system regulation and immune-related genetic conditions.',
    },
    {
        id: '12',
        label: 'Ophthalmic',
        value: 'OPHTHALMIC',
        description: 'Associated with the eyes and vision-related disorders.',
        strengths: 'Focuses on conditions impacting visual acuity, ocular structures, and retinal health.',
    },
    {
        id: '13',
        label: 'Other',
        value: 'OTHER',
        description: 'Any additional or unclassified associated systems not included in the predefined categories.',
        strengths: 'Allows flexibility to include emerging or unique system-related conditions.',
    },
];

export const MOLECULAR_MECHANISMS: Option[] = [
    {
        id: '1',
        label: 'Loss-of-Function',
        value: 'LOSS_OF_FUNCTION',
        description: 'A molecular mechanism where a mutation results in the reduced or complete loss of a protein\'s normal activity.',
        strengths: 'Enables targeted therapies to restore or compensate for the lost function.',
    },
    {
        id: '2',
        label: 'Gain-of-Function',
        value: 'GAIN_OF_FUNCTION',
        description: 'A molecular mechanism where a mutation results in increased, novel, or constitutive activity of a protein.',
        strengths: 'Focuses on strategies to inhibit or regulate the aberrant activity caused by the mutation.',
    },
    {
        id: '3',
        label: 'Haploinsufficiency',
        value: 'HAPLOINSUFFICIENCY',
        description: 'A mechanism where one copy of a gene is insufficient to produce adequate protein levels for normal function.',
        strengths: 'Targets strategies to enhance expression or compensate for the insufficient protein levels.',
    },
    {
        id: '4',
        label: 'Epigenetic Dysregulation',
        value: 'EPIGENETIC_DYSREGULATION',
        description: 'Changes in DNA methylation, histone modification, or chromatin structure affect gene expression without altering the DNA sequence.',
        strengths: 'Targets therapies to restore normal gene expression patterns or epigenetic states.',
    },
    {
        id: '5',
        label: 'Splicing Defects',
        value: 'SPLICING_DEFECTS',
        description: 'Mutations disrupt normal RNA splicing, leading to aberrant or truncated protein production.',
        strengths: 'Targets therapies to correct splicing or bypass splicing errors.',
    },
    {
        id: '6',
        label: 'Mitochondrial Dysfunction',
        value: 'MITOCHONDRIAL_DYSFUNCTION',
        description: 'Mutations in mitochondrial or nuclear DNA affect energy production and cellular signaling.',
        strengths: 'Focuses on therapies to support mitochondrial function or compensate for energy deficits.',
    },
    {
        id: '7',
        label: 'Unstable Repeat Expansions',
        value: 'UNSTABLE_REPEAT_EXPANSIONS',
        description: 'Nucleotide repeat expansions cause toxicity or disrupt normal gene function.',
        strengths: 'Focuses on reducing repeats, mitigating toxicity, or bypassing the effects of expansions.',
    },
    {
        id: '8',
        label: 'Microdeletions or Duplications',
        value: 'MICRODELETIONS_DUPLICATIONS',
        description: 'Structural variations that remove or duplicate parts of a gene or regulatory region, affecting expression or function.',
        strengths: 'Allows for targeted approaches to correct or bypass structural variations.',
    },
    {
        id: '9',
        label: 'Unknown',
        value: 'UNKNOWN',
        description: 'A molecular mechanism where the specific effect of the mutation on the protein\'s function is not yet determined.',
        strengths: 'Allows exploration and categorization of mechanisms as new insights become available.',
    },
];


export default function ResearchOnboardingForm(
    {
        previousLink,
        nextLink,
        showSkip,
    }:
    {
        previousLink: string,
        nextLink: string,
        showSkip: boolean,
    }
) {
    faker.seed(123)
    const session = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof researchOnboardingFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(researchOnboardingFormSchema)
    })

    async function onSubmit(values: z.infer<typeof researchOnboardingFormSchema>) {
        setLoading(true)

        try {
            const sessionData = session.data;

            if (!sessionData?.user.organizationId) {
                toast.error("You're not signed into an organization right now.");
                return;
            }

            // Create FormData object
            const formData = new FormData();

            // Map form values into FormData
            const data = {
                interestedModalities: values.modalities?.map((modality) => modality.value).join(",") || "",
                name: values.disorder || "",
                diseaseCategories: values.categories?.map((category) => category.value).join(",") || "",
                prevalenceNumerator: values.prevalenceNumerator ? values.prevalenceNumerator.toString() : "",
                prevalenceDenominator: values.prevalenceDenominator ? values.prevalenceDenominator.toString() : "",
                numberOfIdentifiedPatients: values.population ? values.population.toString() : "",
                relevantDiseaseMechanisms: values.mechanisms?.join(",") || "",
                associatedGenes: values.genes?.map((gene) => gene.value).join(",") || "",
                associatedSystems: values.systems?.map((symptom) => symptom.value).join(",") || "",
                associatedSignsAndSymptoms: values.symptoms?.map((symptom) => symptom.value).join(",") || "",
                existingDatabasesAndStudies: values.studies?.map((study) => study.value).join(",") || "",
                assetsUnderDevelopment: values.assets?.map((asset) => asset.value).join(",") || "",
            };

            // Append data to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            try {
                await createCondition(formData)

                toast.success("Successfully created condition.")
                router.push(nextLink)
            } catch (error) {
                console.error("Failed to create condition:", error)
                toast.error("An error occurred while creating the condition.")
            }
        } catch (error) {
            toast.error("An error occurred while creating the condition.")
        } finally {
            setLoading(false)
        }
    }

    const handleAsyncSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        setLoading(true);

        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="relative grid grid-cols-2 gap-x-8">
                <div className="space-y-4 col-span-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
                                name="disorder"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Name of condition`}</FormLabel>
                                        <FormDescription>{`The name of your rare condition/disorder.`}</FormDescription>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                id="disorder"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="summary"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Summary of condition`}</FormLabel>
                                        <FormDescription>{`A few lines describing your condition and what makes it unique`}</FormDescription>
                                        <FormControl>
                                            <Textarea
                                                id="summary"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categories"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mechanisms of Action
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`What type of condition is ${'disoder name'}`}
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <FaQuestionCircle
                                                        className="text-black h-4 inline-block align-baseline mx-1"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {`This will help us match you with the experts of your particular modality.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MOLECULAR_MECHANISMS}
                                                placeholder="Select categories that apply to you..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="modalities"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Modalities of interest
                                        </FormLabel>
                                        <FormDescription className="flex items-center">
                                            {`The treatment modalities of interest of your organization.`}
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger>
                                                    <FaQuestionCircle
                                                        className="text-black h-4 inline-block align-baseline mx-1"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        {`This will help us match you with the experts of your particular modality.`}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={MODALITIES}
                                                placeholder="Select modalities you like..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="mechanisms"*/}
                            {/*    render={({field}) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>Relevant disease mechanisms</FormLabel>*/}
                            {/*            <FormDescription>{`The relevant mechanisms of your disorder`}</FormDescription>*/}
                            {/*            <FormControl>*/}
                            {/*                <MultipleSelector*/}
                            {/*                    {...field}*/}
                            {/*                    defaultOptions={OPTIONS}*/}
                            {/*                    placeholder="Select the mechanisms that apply to your disorder..."*/}
                            {/*                    emptyIndicator={*/}
                            {/*                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">*/}
                            {/*                            no results found.*/}
                            {/*                        </p>*/}
                            {/*                    }*/}
                            {/*                />*/}
                            {/*            </FormControl>*/}
                            {/*            <FormMessage/>*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="mechanisms"*/}
                            {/*    render={({field}) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>Relevant disease mechanisms</FormLabel>*/}
                            {/*            <FormDescription>{`The relevant mechanisms of your condition.`}</FormDescription>*/}
                            {/*            <FormControl>*/}
                            {/*                <ToggleGroup*/}
                            {/*                    type="multiple"*/}
                            {/*                    variant="outline"*/}
                            {/*                    value={field.value}*/}
                            {/*                    onValueChange={*/}
                            {/*                        field.onChange*/}
                            {/*                    }*/}
                            {/*                    className="w-fit flex flex-wrap gap-2 justify-start"*/}
                            {/*                >*/}
                            {/*                    {mechanisms.map(type => (*/}
                            {/*                        <ToggleGroupItem*/}
                            {/*                            key={type.id}*/}
                            {/*                            value={type.id}*/}
                            {/*                        >*/}
                            {/*                            {type.name}*/}
                            {/*                        </ToggleGroupItem>*/}
                            {/*                    ))}*/}
                            {/*                </ToggleGroup>*/}
                            {/*            </FormControl>*/}
                            {/*            <FormMessage/>*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}

                            <FormField
                                control={form.control}
                                name="genes"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Associated genes</FormLabel>
                                        <FormDescription>{`The genes associated with your condition.`}</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                onSearch={handleAsyncSearch}
                                                placeholder="Search for genes..."
                                                loadingIndicator={<p>Loading genes...</p>}
                                                emptyIndicator={<p>No genes found.</p>}
                                                showHoverCard={false}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="systems"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Associated systems</FormLabel>
                                        <FormDescription>{`The systems affected by your condition.`}</FormDescription>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                defaultOptions={ASSOCIATED_SYSTEMS}
                                                placeholder="Select the associated systems of your condition..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="prevalenceNumerator"
                                render={({field: numeratorField}) => (
                                    <FormItem>
                                        <FormLabel>{`Estimated total prevalence`}</FormLabel>
                                        <FormDescription>
                                            {`The estimated total number of patients in the world.`}
                                        </FormDescription>
                                        <FormControl>
                                            <div className="flex flex-row items-end justify-start space-x-2">
                                                <Input
                                                    type="number"
                                                    id="prevalenceNumerator"
                                                    {...numeratorField}
                                                    className="w-16"
                                                    min={0}
                                                />
                                                <span>in</span>
                                                <FormField
                                                    control={form.control}
                                                    name="prevalenceDenominator"
                                                    render={({field: denominatorField}) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                id="prevalenceDenominator"
                                                                {...denominatorField}
                                                                className="w-32"
                                                                min={0}
                                                            />
                                                        </FormControl>
                                                    )}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="population"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{`Number of patients identified`}</FormLabel>
                                        <FormDescription>{`The number of known patients (not the estimated total). The people in this count should be reachable by your organization.`}</FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                id="population"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row space-x-2">
                                    <Button onClick={() => router.push(previousLink)}>
                                        Previous
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <LoadingDots color="#808080"/> : "Next"}
                                    </Button>
                                </div>
                                {showSkip &&
                                    <Button variant="ghost" onClick={() => router.push("/app/finances")}>
                                        Skip for now
                                    </Button>
                                }
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="sticky top-8 col-span-1 space-y-4 border-2 rounded-lg h-[calc(100vh-280px)]">
                    <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-8">
                        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-gray-900 mb-4">
                            Condition profile preview
                        </h1>

                        <div className="w-full flex flex-col items-center justify-center space-y-8">

                            <div className="flex flex-col mx-auto w-full text-center md:w-7/12 space-y-4">
                                <div className="inline-flex items-baseline justify-center">
                                    {form.watch("disorder") ?
                                        <h1 className="font-title text-lg font-bold text-stone-800 dark:text-white md:text-xl">
                                            {form.watch("disorder")}
                                        </h1>
                                        : <Skeleton className="w-96 h-12"/>
                                    }
                                </div>
                            </div>

                            <div className="grid grid-cols-3">
                                <div className="space-y-2">
                                    <h3 className="text-center scroll-m-20 tracking-tight font-semibold">
                                        Mechanisms of Action
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-y-1 gap-x-1">
                                        {form.watch("categories") ? form.watch("categories")?.map((category, index) =>
                                            <Badge key={index}>
                                                {category.label}
                                            </Badge>
                                        ) : Array.from({
                                            length: faker.number.int({
                                                min: 1,
                                                max: 3
                                            })
                                        }).map((_, index) => <Skeleton key={index} className="h-4 w-1/4"/>)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-center scroll-m-20 tracking-tight font-semibold">
                                        Associated Systems
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-y-1 gap-x-1">
                                        {form.watch("symptoms") ? form.watch("symptoms")?.map((sign, index) =>
                                            <Badge key={index}>
                                                {sign.label}
                                            </Badge>
                                        ) : Array.from({
                                            length: faker.number.int({
                                                min: 1,
                                                max: 3
                                            })
                                        }).map((_, index) => <Skeleton key={index} className="h-4 w-1/4"/>)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-center scroll-m-20 tracking-tight font-semibold">
                                        Associated Genes
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-y-1 gap-x-1">
                                        {form.watch("genes") ? form.watch("genes")?.map((gene, index) =>
                                            <Badge key={index}>
                                                {gene.label}
                                            </Badge>
                                        ) : Array.from({
                                            length: faker.number.int({
                                                min: 1,
                                                max: 3
                                            })
                                        }).map((_, index) => <Skeleton key={index} className="h-4 w-1/4"/>)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 grid-cols-2 w-full">

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className={cn("scroll-m-20 tracking-tight font-semibold")}>
                                            Description
                                        </h3>
                                        <p className="flex flex-col space-y-2">
                                            {form.watch("summary") ? (
                                                <span>{form.watch("summary")}</span>
                                            ) : (
                                                <>
                                                    <Skeleton className="h-4 w-1/3"/>
                                                    <Skeleton className="h-4 w-full rounded-md"/>
                                                    <Skeleton className="h-4 w-full rounded-md"/>
                                                    <Skeleton className="h-4 w-full rounded-md"/>
                                                    <Skeleton className="h-4 w-2/3 rounded-md"/>
                                                    <Skeleton className="h-4 w-1/4 rounded-md"/>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className={cn("scroll-m-20 tracking-tight font-semibold")}>
                                            Stats
                                        </h3>
                                        <Card className="w-min">
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 space-x-4 p-4">
                                                <CardTitle className="text-sm font-medium">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            Prevalence
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80">
                                                            <p>
                                                                {`The estimated proportion of a population that has a characteristic at a specific time, regardless of when they first developed it.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </CardTitle>
                                                <FaUsersViewfinder/>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="inline-flex items-center text-base font-bold">
                                                    {form.watch("prevalenceNumerator") ? form.watch("prevalenceNumerator") :
                                                        <Skeleton
                                                            className="w-8 h-8"/>}&nbsp; in&nbsp; {form.watch("prevalenceDenominator") ? form.watch("prevalenceDenominator") :
                                                    <Skeleton className="w-8 h-8"/>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
