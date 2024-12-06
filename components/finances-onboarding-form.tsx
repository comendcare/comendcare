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
import {Separator} from "@/components/ui/separator";
import {FaQuestionCircle} from "react-icons/fa";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Timer} from "lucide-react";

const invitationFormSchema = z.object({
    raising: z.enum(["yes", "no-but", "no"], {
        required_error: "You need to select a 501c3 status.",
    }).optional(),
    raised: z.number().min(2, {
        message: "Your organization's description.",
    }).optional(),
    budget: z.string().min(2, {
        message: "Your organization's description.",
    }).optional(),
    deployed: z.string().min(2, {
        message: "Your organization's description.",
    }).optional(),
})

export default function FinancesOnboardingForm() {
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
                } else {
                    const {id} = res
                    router.refresh()
                    router.push("/onboarding/research")
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
                            Finances onboarding
                        </h1>

                        <p
                            className="inline-flex flex-row justify-center items-center gap-x-2 w-min text-base truncate rounded-md bg-stone-100 px-4 py-2 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"
                        >
                            <Timer/>
                            {`< 5 min`}
                        </p>
                    </div>
                    <p>
                        {`With these questions we're seeking to understand your organization's capacity for advancing research in topics relevant to your group. Hover over the `}
                        <span className="inline-flex items-center">
                            {" "}
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <FaQuestionCircle className="h-4 inline-block align-baseline mx-1"/>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Hello there!</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        {` if you're wondering why we need to know something.`}
                    </p>
                    <p className="font-semibold">
                        {`A reminder that we won't share what you provide with anyone, and you have complete control of what info is made public on your organization profile and research plan.`}
                    </p>
                </div>

                <Separator/>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <FormField
                            control={form.control}
                            name="raising"
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="flex items-center">
                                        {`Are you currently raising money?`}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <FaQuestionCircle
                                                    className="text-black h-4 inline-block align-baseline mx-1"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {`If raising money for your organization is a priority, we'll match you with grants.`}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
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
                                    <FormDescription className="flex items-center">
                                        {`The total amount of funding raised to date by your patient group.`}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <FaQuestionCircle
                                                    className="text-black h-4 inline-block align-baseline mx-1"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {`Just a ballpark estimate so that we know to recommend vendors within a reasonable price range.`}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormDescription>
                                    <FormControl>
                                        <Slider
                                            min={0}
                                            max={1000000}
                                            step={50000}
                                            defaultValue={value ? [value] : [0]}
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
                                    <FormDescription className="flex items-center">
                                        {`The total amount of money deployed to research to date.`}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <FaQuestionCircle
                                                    className="text-black h-4 inline-block align-baseline mx-1"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Knowing how much you have deployed to research so far helps us
                                                    understand how much experience you have with driving research.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormDescription>
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
                                    <FormDescription className="flex items-center">
                                        {`The amount of money allocated to advancing research.`}
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <FaQuestionCircle
                                                    className="text-black h-4 inline-block align-baseline mx-1"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Knowing how much you have budgeted to research helps us prioritize
                                                    based on what you prioritize.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormDescription>
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

                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row space-x-2">
                                <Button onClick={() => router.push("/onboarding/organization")}>Previous</Button>
                                <Button type="submit">Finish</Button>
                            </div>
                            <Button variant="ghost" onClick={() => router.push("/app/profile")}>Skip</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </TooltipProvider>
    )
}
