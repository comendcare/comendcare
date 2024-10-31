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
    name: z.string().min(2, {
        message: "Your name must be at least 2 characters."
    }),
    role: z.string().min(2, {
        message: "Your role must be at least 2 characters.",
    }),
    orgName: z.string().min(2, {
        message: "Your organization's name must be at least 2 characters."
    }),
    slug: z.string().min(2, {
        message: "Your organization's slug must be at least 2 characters."
    }),
    looking: z.array(optionSchema).min(0).optional(),
    founded: z.string().min(2, {
        message: "The year that your organization was founded.",
    }).optional(),
    description: z.string().min(2, {
        message: "Your organization's description.",
    }),
    "501c3": z.enum(["yes", "no-but", "no"], {
        required_error: "You need to select a 501c3 status.",
    }).optional(),
    website: z.string().min(2, {
        message: "Your organization's website.",
    }).optional(),
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
    const {data: session, update} = useSession()
    const router = useRouter()
    console.log(session)

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema)
    })

    async function updateSession(organizationId: string) {
        await update({
            ...session,
            organizationId: organizationId,
        })
    }

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
        Object.entries(form.getValues()).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
            }
        });

        createOrganization(formData).then((res: any) => {
            console.log(res)
            if (res.error) {
                toast.error(res.error)
            } else {
                va.track("Created Organization")
                // Update the session object with the newly created organizationId
                updateSession(res.id)
                router.refresh()
                router.push("/onboarding/finances")
                toast.success(`Successfully created organization!`)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your name</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Spongebob Squarepants"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Founder and Chair" {...field} />
                            </FormControl>
                            <FormDescription>
                                Your role at your patient organization.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="orgName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{`Organization name`}</FormLabel>
                            <FormDescription>{`The name of your organization`}</FormDescription>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="name"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{`Nickname`}</FormLabel>
                            <FormDescription>{`The abbreviated, short form, or nickname for your organization.`}</FormDescription>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="name"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="looking"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Looking for`}</FormLabel>
                            <FormDescription>{`What you're looking for and hoping to get from joining Comend.`}</FormDescription>
                            <FormControl>
                                <MultipleSelector
                                    {...field}
                                    defaultOptions={OPTIONS}
                                    placeholder="Select options that appeal to you..."
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
                    name="founded"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Year founded`}</FormLabel>
                            <FormDescription>{`The abbreviated, short form, or nickname for your organization.`}</FormDescription>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="name"
                                    autoComplete="name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="501c3"
                    render={({field}) => (
                        <FormItem className="space-y-3">
                            <FormLabel>{`What is your 501c3 status`}</FormLabel>
                            <FormDescription>{`Whether you have incorporated your patient group as a non-profit yet.`}</FormDescription>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="yes"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Yes I have a 501c3
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="no-but"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No, but I'm working on it`}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="no"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No I don't have a 501c3`}
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Website`}</FormLabel>
                            <FormDescription>{`Your patient group's website URL.`}</FormDescription>
                            <FormControl>
                                <Input
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormDescription>
                                This will be the public description of your organization.
                            </FormDescription>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Next</Button>
            </form>
        </Form>
    );

}
