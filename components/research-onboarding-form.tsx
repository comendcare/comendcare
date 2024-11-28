"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {updateOrganization} from "@/lib/actions";
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
import {Timer} from "lucide-react";

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const invitationFormSchema = z.object({
    modalities: z.array(optionSchema).min(0),
    disorder: z.string().min(2, {
        message: "Your organization's description.",
    }),
    categories: z.array(optionSchema).min(0),
    prevalenceNumerator: z.string().min(1, {
        message: "Your organization's description.",
    }),
    prevalenceDenominator: z.string().min(1, {
        message: "Your organization's description.",
    }),
    population: z.string().min(1, {
        message: "Your organization's description.",
    }),
    // mechanisms: z.array(optionSchema).min(0),
    mechanisms: z.array(z.string()).min(0),
    genes: z.array(optionSchema).min(0),
    biomarkers: z.array(optionSchema).min(0),
    symptoms: z.array(optionSchema).min(0),
    studies: z.array(optionSchema).min(0),
    assets: z.array(optionSchema).min(0),
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

export const OPTIONS: Option[] = [
    {
        id: '1',
        label: 'nextjs',
        value: 'Nextjs',
        description: 'A React framework for building server-side rendered (SSR) and static web applications. It simplifies routing, API handling, and rendering optimizations.',
        strengths: 'Out-of-the-box SSR and static site generation (SSG), built-in API routes, and strong developer tooling with performance optimizations.',
    },
    {
        id: '2',
        label: 'React',
        value: 'react',
        description: 'A popular JavaScript library for building user interfaces, especially for single-page applications (SPAs). React focuses on the component-based architecture.',
        strengths: 'Highly reusable components, vast community support, and strong performance with Virtual DOM rendering.',
    },
    {
        id: '3',
        label: 'Remix',
        value: 'remix',
        description: 'A modern framework focused on seamless data fetching and SSR for web applications. Remix emphasizes web standards and progressive enhancement.',
        strengths: 'Provides full-stack capabilities with SSR, optimized for caching and streaming, and excellent support for nested routing.',
    },
    {
        id: '4',
        label: 'Vite',
        value: 'vite',
        description: 'A fast, next-generation frontend build tool that offers a modern development experience with minimal configuration.',
        strengths: 'Extremely fast hot module replacement (HMR), native support for modern JavaScript frameworks, and optimized builds with minimal configuration.',
    },
    {
        id: '5',
        label: 'Nuxt',
        value: 'nuxt',
        description: 'A framework built on top of Vue.js, offering server-side rendering, static site generation, and powerful meta handling.',
        strengths: 'Provides SSR and static site generation, excellent support for SEO, and an integrated module ecosystem.',
    },
    {
        id: '6',
        label: 'Vue',
        value: 'vue',
        description: 'A progressive JavaScript framework for building user interfaces, known for its simplicity and ease of integration.',
        strengths: 'Lightweight, flexible, and offers two-way data binding with a gentle learning curve.',
    },
    {
        id: '7',
        label: 'Svelte',
        value: 'svelte',
        description: 'A compiler-based framework that shifts work from the browser to build time, producing highly optimized JavaScript code.',
        strengths: 'Produces highly efficient code, has no virtual DOM, and offers a straightforward syntax.',
    },
    {
        id: '8',
        label: 'Angular',
        value: 'angular',
        description: 'A robust, full-featured framework maintained by Google, designed for building large-scale, complex applications.',
        strengths: 'Provides powerful tools for enterprise-level applications, strong TypeScript support, and a comprehensive framework out of the box.',
    },
    {
        id: '9',
        label: 'Ember',
        value: 'ember',
        disable: true,
        description: 'A mature framework known for its convention-over-configuration approach, used primarily for ambitious web applications.',
        strengths: 'Offers strong conventions, built-in best practices, and a cohesive ecosystem with long-term stability.',
    },
    {
        id: '10',
        label: 'Gatsby',
        value: 'gatsby',
        disable: true,
        description: 'A React-based framework for building static websites and apps, with a focus on performance and data integration.',
        strengths: 'Optimized for static site generation, supports rich plugins, and offers fast page loads with modern web practices.',
    },
    {
        id: '11',
        label: 'Astro',
        value: 'astro',
        description: 'A modern framework for building content-rich websites that ships minimal JavaScript to the browser.',
        strengths: 'Ships minimal JavaScript by default, offers multi-framework support, and provides excellent performance for content-driven sites.',
    },
];

export const mechanisms = [
    {id: "GENETIC_MUTATION", name: "Genetic mutation"},
    {id: "CHROMOSOMAL_ABNORMALITY", name: "Chromosomal abnormality"},
    {id: "IMMUNE_DYSFUNCTION", name: "Immune dysfunction"},
    {id: "METABOLIC_DEFECT", name: "Metabolic pathway defect"},
    {id: "MITOCHONDRIAL_ABNORMALITY", name: "Mitochondrial abnormality"},
    {id: "EPIGENETIC_MODIFICATION", name: "Epigenetic modification"}
];

export default function ResearchOnboardingForm() {
    const session = useSession()
    const router = useRouter()

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema)
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {

        const formData = new FormData()

        if (session.data?.user.organizationId) {
            updateOrganization(formData, session.data.user.organizationId, "key").then((res: any) => {
                if (res.error) {
                    toast.error(res.error)
                    router.push("/app/profile")
                } else {
                    const {id} = res
                    router.refresh()
                    router.push("/app/profile")
                    toast.success(`Successfully saved changes.`)
                }
            })
        } else {
            toast.error("You're not signed into an organization right now.")
        }
    }

    return (
        <TooltipProvider>
            <div className="space-y-4 w-1/2">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Research onboarding
                        </h1>

                        <p className="inline-flex flex-row justify-center items-center gap-x-2 text-xl">
                            <Timer/>
                            {`Estimated time: 6 min`}
                        </p>
                    </div>
                    <p>
                        {`
                        Lastly, we have some questions about the nature of your disorder, it's demographic, and the ongoing efforts towards treatments and cures.
                        `}
                    </p>
                </div>

                <Separator/>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <FormField
                            control={form.control}
                            name="disorder"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{`Name of disorder`}</FormLabel>
                                    <FormDescription>{`The name of your rare disease/disorder.`}</FormDescription>
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
                            name="categories"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Disease categories</FormLabel>
                                    <FormDescription className="flex items-center">
                                        {`What type of disorder is ${'disoder name'}`}
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
                                            defaultOptions={OPTIONS}
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
                                    <FormLabel>Modalities</FormLabel>
                                    <FormDescription className="flex items-center">
                                        {`The treatment modalities of interest by your organization.`}
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
                                            defaultOptions={OPTIONS}
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

                        <FormField
                            control={form.control}
                            name="prevalenceNumerator"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{`Estimated total prevalence`}</FormLabel>
                                    <FormDescription>{`The estimated total number of patients in the world.`}</FormDescription>
                                    <FormControl>
                                        <div className="flex flex-row items-end justify-start">
                                            <Input
                                                type="number"
                                                id="population"
                                                {...field}
                                                className="w-16"
                                            />
                                            &nbsp;in&nbsp;
                                            <FormField
                                                control={form.control}
                                                name="prevalenceDenominator"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                id="population"
                                                                {...field}
                                                                className="w-32"
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
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

                        <FormField
                            control={form.control}
                            name="mechanisms"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Relevant disease mechanisms</FormLabel>
                                    <FormDescription>{`The relevant mechanisms of your disorder.`}</FormDescription>
                                    <FormControl>
                                        <ToggleGroup
                                            type="multiple"
                                            variant="outline"
                                            value={field.value}
                                            onValueChange={
                                                field.onChange
                                            }
                                            className="w-fit flex flex-wrap gap-2 justify-start"
                                        >
                                            {mechanisms.map(type => (
                                                <ToggleGroupItem
                                                    key={type.id}
                                                    value={type.id}
                                                >
                                                    {type.name}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="genes"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Associated genes</FormLabel>
                                    <FormDescription>{`The genes associated with your disorder.`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={OPTIONS}
                                            placeholder="Select the associated genes of your disorder..."
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
                            name="biomarkers"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Associated biomarkers</FormLabel>
                                    <FormDescription>{`The biomarkers that have been identified for your disorder.`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={OPTIONS}
                                            placeholder="Select the associated biomarkers of your disorder..."
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
                            name="symptoms"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Associated signs and symptoms</FormLabel>
                                    <FormDescription>{`The hallmark signs and symptoms of your disorder.`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={OPTIONS}
                                            placeholder="Select the associated signs and symptoms of your disorder..."
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
                            name="studies"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Existing patient databases or clinical studies</FormLabel>
                                    <FormDescription>{`Does your organization have any patient databases or clinical studies?`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={OPTIONS}
                                            placeholder="Select the associated signs and symptoms of your disorder..."
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
                            name="assets"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Assets under development</FormLabel>
                                    <FormDescription>{`Does your disorder have any existing or assets under development?`}</FormDescription>
                                    <FormControl>
                                        <MultipleSelector
                                            {...field}
                                            defaultOptions={OPTIONS}
                                            placeholder="Select the assets that apply to you..."
                                            creatable
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

                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row space-x-2">
                                <Button onClick={() => router.push("/onboarding/finances")}>Previous</Button>
                                <Button type="submit">Next</Button>
                            </div>
                            <Button variant="ghost" onClick={() => router.push("/app/profile")}>Skip</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    );
}
