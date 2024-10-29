"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createOrganization, createOrGetSite} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Slider} from "@/components/ui/slider";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const invitationFormSchema = z.object({
    raised: z.number().min(2, {
        message: "Your organization's description.",
    }),
    budget: z.string().min(2, {
        message: "Your organization's description.",
    }),
    deployed: z.string().min(2, {
        message: "Your organization's description.",
    }),
})

const OPTIONS: Option[] = [
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

export default function OrganizationOnboardingForm() {
    const session = useSession()
    const router = useRouter()

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema)
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {
        // console.log(values)
        // const createOrg = await createOrGetSite({
        //         siteName: form.getValues("orgName"),
        //         siteSlug: form.getValues("slug")
        //     },
        //     session.data?.user.id,
        //     form.getValues("description")
        // )
        //
        // console.log(createOrg)

        const formData = new FormData()

        createOrganization(formData).then((res: any) => {
            if (res.error) {
                toast.error(res.error)
            } else {
                va.track("Created Site")
                const { id } = res
                router.refresh()
                router.push(`/admin/organization/${id}`)
                toast.success(`Successfully created organization!`)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/2">

                {/*<FormField*/}
                {/*    control={form.control}*/}
                {/*    name="raised"*/}
                {/*    render={({field}) => (*/}
                {/*        <FormItem>*/}
                {/*            <FormLabel>{`Total raised`}</FormLabel>*/}
                {/*            <FormDescription>{`The total amount of funding raised to date by your patient group.`}</FormDescription>*/}
                {/*            <FormControl>*/}
                {/*                <Input*/}
                {/*                    variant="currency"*/}
                {/*                    type="url"*/}
                {/*                    id="website"*/}
                {/*                    {...field}*/}
                {/*                />*/}
                {/*            </FormControl>*/}
                {/*            <FormMessage/>*/}
                {/*        </FormItem>*/}
                {/*    )}*/}
                {/*/>*/}

                <FormField
                    control={form.control}
                    name="raised"
                    render={({field: {value, onChange}}) => (
                        <FormItem>
                            <FormLabel>Raised - {value}</FormLabel>
                            <FormDescription>{`The total amount of funding raised to date by your patient group.`}</FormDescription>
                            <FormControl>
                                <Slider
                                    min={0}
                                    max={1000000}
                                    step={50000}
                                    defaultValue={[value]}
                                    onValueChange={(vals: number[]) => {
                                        onChange(vals[0]);
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                This is a description for the price.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deployed"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Money deployed to research`}</FormLabel>
                            <FormDescription>{`The total amount of money deployed to research to date.`}</FormDescription>
                            <FormControl>
                                <Input
                                    variant="currency"
                                    type="url"
                                    id="website"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="budget"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Annual research budget`}</FormLabel>
                            <FormDescription>{`The amount of money allocated to advancing research.`}</FormDescription>
                            <FormControl>
                                <Input
                                    variant="currency"
                                    type="url"
                                    id="website"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );

}
