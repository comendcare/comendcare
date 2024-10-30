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
    raising: z.enum(["yes", "no-but", "no"], {
        required_error: "You need to select a 501c3 status.",
    }),
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

export default function FinancesOnboardingForm() {
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

                <FormField
                    control={form.control}
                    name="raising"
                    render={({field}) => (
                        <FormItem className="space-y-3">
                            <FormLabel>{`Are you currently raising money?`}</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="Yes"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`Yes I'm currently raising`}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="no-but"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No, but I'm planning to soon`}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="no"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No I'm not raising money`}
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

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

                <div className="flex flex-row space-x-2">
                    <Button onClick={() => router.push("/onboarding/organization")}>Previous</Button>
                    <Button type="submit">Next</Button>
                </div>
            </form>
        </Form>
    );

}
