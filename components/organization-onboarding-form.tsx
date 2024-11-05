"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createOrganization, getAllOrganizations} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const joinOrgFormSchema = z.object({
    org: z.array(optionSchema).min(0).optional(),
})

const newOrgFormSchema = z.object({
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
];

export default function OrganizationOnboardingForm() {
    const {data: session, update} = useSession()
    const router = useRouter()
    const [isNewOrganization, setIsNewOrganization] = useState(true)
    const [organizations, setOrganizations] = useState<Option[]>([])
    console.log(organizations)

    useEffect(() => {
        fetchOrganizations();
    }, [])

    const fetchOrganizations = async () => {
        await getAllOrganizations().then((res) => {
            const options: Option[] = res.map((org, index) => ({
                value: org.id || index.toString(),
                label: org.name || "",
                description: org.description || "",
            }))

            setOrganizations(options)
        })
    };

    const joinOrgForm = useForm<z.infer<typeof joinOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(joinOrgFormSchema)
    })

    const newOrgForm = useForm<z.infer<typeof newOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(newOrgFormSchema)
    })

    async function updateSession(organizationId: string) {
        await update({
            ...session,
            organizationId: organizationId,
        })
    }

    async function joinOrgOnSubmit(values: z.infer<typeof joinOrgFormSchema>) {
        const formData = new FormData()
        Object.entries(newOrgForm.getValues()).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
            }
        });
    }

    async function newOrgOnSubmit(values: z.infer<typeof newOrgFormSchema>) {
        // console.log(values)
        // const createOrg = await createOrGetSite({
        //         siteName: newOrgForm.getValues("orgName"),
        //         siteSlug: newOrgForm.getValues("slug")
        //     },
        //     session.data?.user.id,
        //     newOrgForm.getValues("description")
        // )
        //
        // console.log(createOrg)

        const formData = new FormData()
        Object.entries(newOrgForm.getValues()).forEach(([key, value]) => {
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
        <div className="space-y-4">
            {/* Toggle between joining or creating an organization */}
            <div className="flex items-center space-x-2">
                <Switch
                    id="new-organization"
                    checked={isNewOrganization}
                    onCheckedChange={() => setIsNewOrganization(!isNewOrganization)}
                />
                <Label htmlFor="new-organization">
                    {isNewOrganization ? "Join an existing organization instead" : "Create a new organization instead"}
                </Label>
            </div>

            {/* Conditionally render newOrgForm based on the toggle state */}
            {isNewOrganization ? (
                // Form to create a new organization
                <Form {...newOrgForm}>
                    <form onSubmit={newOrgForm.handleSubmit(newOrgOnSubmit)} className="space-y-8 w-1/2">

                        <FormField
                            control={newOrgForm.control}
                            name="orgName"
                            render={({field}) => (
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
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={newOrgForm.control}
                            name="slug"
                            render={({field}) => (
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
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={newOrgForm.control}
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
                            control={newOrgForm.control}
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
                            control={newOrgForm.control}
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
                            control={newOrgForm.control}
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
                            control={newOrgForm.control}
                            name="description"
                            render={({field}) => (
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
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-row space-x-2">
                            <Button onClick={() => router.push("/onboarding/user")}>Previous</Button>
                            <Button type="submit">Next</Button>
                        </div>
                    </form>
                </Form>
            ) : (
                // Form to join an existing organization
                <div className="space-x-4">
                    <h3 className="text-lg font-semibold">Join an Existing Organization</h3>
                    <Form {...joinOrgForm}>
                        <form onSubmit={joinOrgForm.handleSubmit(joinOrgOnSubmit)} className="space-y-8">
                            <FormField
                                control={joinOrgForm.control}
                                name="org"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Organization name
                                        </FormLabel>
                                        <FormControl>
                                            <MultipleSelector
                                                {...field}
                                                maxSelected={1}
                                                defaultOptions={organizations}
                                                placeholder="Select your organization..."
                                                emptyIndicator={
                                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                        no results found.
                                                    </p>
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The invitation to your organization will be sent here.
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="">Join Organization</Button>
                        </form>
                    </Form>
                </div>
            )}
        </div>
    );
}
