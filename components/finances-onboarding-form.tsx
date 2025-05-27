"use client"
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {updateOrganization} from "@/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useState} from "react";
import MoneyInput from "@/components/money-input";
import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "@/app/mixpanel";

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
            const response = await updateOrganization(session.data.user.organizationId, formData);
            // mixpanelTrack("Onboarding Completed")
            toast.success("Organization updated successfully!");
            router.push("/app/marketplace/service-providers");
        } catch (error) {
            toast.error("Failed to update organization.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <MoneyInput
                    form={form}
                    label="Total funds raised to date"
                    description="The total amount of funding raised to date by your patient group."
                    name="raised"
                />

                <MoneyInput
                    form={form}
                    label="Total funds deployed to research"
                    description="The total amount of money deployed to research to date."
                    name="deployed"
                />

                <MoneyInput
                    form={form}
                    label="Annual research budget"
                    description="The amount of money allocated to advancing research this year."
                    name="budget"
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
