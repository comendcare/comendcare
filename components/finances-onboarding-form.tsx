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
import {useEffect, useState} from "react";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {formatMoney} from "@/lib/utils";

export const financesFormSchema = z.object({
    // raising: z.enum(["yes", "no-but", "no"]).optional(),
    raised: z.number().optional(),
    budget: z.number().optional(),
    deployed: z.number().optional(),
})

export default function FinancesOnboardingForm(
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
    const session = useSession()
    const router = useRouter()
    const [defaultValues, setDefaultValues] = useState<z.infer<typeof financesFormSchema> | undefined>(undefined);

    const form = useForm<z.infer<typeof financesFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(financesFormSchema),
        defaultValues,
    })

    async function onSubmit(values: z.infer<typeof financesFormSchema>) {
        if (!session.data?.user.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        const databaseMap: Partial<Record<keyof typeof values, string>> = {
            raised: "moneyRaised",
            budget: "researchBudget",
            deployed: "moneyDeployed",
            // raising: "raising",
        };

        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = databaseMap[key as keyof typeof databaseMap]; // Explicitly cast key
            if (mappedKey && value !== undefined) {
                formData.append(mappedKey, value.toString());
            }
        });

        try {
            const response = await updateOrganization(formData, session.data.user.organizationId);
            toast.success("Organization updated successfully!");
            router.push("/app/profile");
        } catch (error) {
            toast.error("Failed to update organization.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/*<FormField*/}
                {/*    control={form.control}*/}
                {/*    name="raising"*/}
                {/*    render={({field}) => (*/}
                {/*        <FormItem className="space-y-3">*/}
                {/*            <FormLabel className="flex items-center">*/}
                {/*                {`Are you currently raising money?`}*/}
                {/*                <Tooltip delayDuration={0}>*/}
                {/*                    <TooltipTrigger>*/}
                {/*                        <FaQuestionCircle*/}
                {/*                            className="text-black h-4 inline-block align-baseline mx-1"/>*/}
                {/*                    </TooltipTrigger>*/}
                {/*                    <TooltipContent>*/}
                {/*                        <p>*/}
                {/*                            {`If raising money for your organization is a priority, we'll match you with grants.`}*/}
                {/*                        </p>*/}
                {/*                    </TooltipContent>*/}
                {/*                </Tooltip>*/}
                {/*            </FormLabel>*/}
                {/*            <FormControl>*/}
                {/*                <RadioGroup*/}
                {/*                    onValueChange={field.onChange}*/}
                {/*                    defaultValue={field.value}*/}
                {/*                    className="flex flex-col space-y-1"*/}
                {/*                >*/}
                {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                {/*                        <FormControl>*/}
                {/*                            <RadioGroupItem value="yes"/>*/}
                {/*                        </FormControl>*/}
                {/*                        <FormLabel className="font-normal">*/}
                {/*                            {`Yes I'm currently raising`}*/}
                {/*                        </FormLabel>*/}
                {/*                    </FormItem>*/}
                {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                {/*                        <FormControl>*/}
                {/*                            <RadioGroupItem value="no-but"/>*/}
                {/*                        </FormControl>*/}
                {/*                        <FormLabel className="font-normal">*/}
                {/*                            {`No, but I'm planning to soon`}*/}
                {/*                        </FormLabel>*/}
                {/*                    </FormItem>*/}
                {/*                    <FormItem className="flex items-center space-x-3 space-y-0">*/}
                {/*                        <FormControl>*/}
                {/*                            <RadioGroupItem value="no"/>*/}
                {/*                        </FormControl>*/}
                {/*                        <FormLabel className="font-normal">*/}
                {/*                            {`No I'm not raising money`}*/}
                {/*                        </FormLabel>*/}
                {/*                    </FormItem>*/}
                {/*                </RadioGroup>*/}
                {/*            </FormControl>*/}
                {/*            <FormMessage/>*/}
                {/*        </FormItem>*/}
                {/*    )}*/}
                {/*/>*/}

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
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Total funds raised - {formatMoney(field.value)}</FormLabel>
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
                                {/*<Slider*/}
                                {/*    min={0}*/}
                                {/*    max={1000000}*/}
                                {/*    step={50000}*/}
                                {/*    defaultValue={value ? [value] : [0]}*/}
                                {/*    onValueChange={(vals: number[]) => {*/}
                                {/*        onChange(vals[0]);*/}
                                {/*    }}*/}
                                {/*/>*/}
                                <Input
                                    variant="currency"
                                    type="number"
                                    min={0}
                                    id="raised"
                                    {...field}
                                    onChange={(e) => {
                                        const parsedValue = parseFloat(e.target.value);
                                        field.onChange(!isNaN(parsedValue) ? parsedValue : 0); // Parse to float or default to 0
                                    }}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deployed"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{`Total funds deployed to research`} - {formatMoney(field.value)}</FormLabel>
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
                                    type="number"
                                    min={0}
                                    id="deployed"
                                    {...field}
                                    onChange={(e) => {
                                        const parsedValue = parseFloat(e.target.value);
                                        field.onChange(!isNaN(parsedValue) ? parsedValue : 0); // Parse to float or default to 0
                                    }}
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
                            <FormLabel>{`Annual research budget`} - {formatMoney(field.value)}</FormLabel>
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
                                    type="number"
                                    min={0}
                                    id="budget"
                                    {...field}
                                    onChange={(e) => {
                                        const parsedValue = parseFloat(e.target.value);
                                        field.onChange(!isNaN(parsedValue) ? parsedValue : 0); // Parse to float or default to 0
                                    }}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-2">
                        <Button type="button" onClick={() => router.push(previousLink)}>
                            Previous
                        </Button>
                        <Button type="submit">
                            Finish
                        </Button>
                    </div>
                    {showSkip &&
                        <Button variant="ghost" onClick={() => router.push("/app/profile")}>
                            Skip for now
                        </Button>
                    }
                </div>
            </form>
        </Form>
    )
}
