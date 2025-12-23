"use client"
import {Form} from "@comend/components/ui/form";
import {Button} from "@comend/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {updateOrganization} from "@comend/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useState} from "react";
import MoneyInput from "@comend/components/money-input";
import { editOrgFormSchema } from "@comend/lib/types";
import LoadingDots from "@comend/components/icons/loading-dots";

export default function FinancesOnboardingForm(
    {
        organizationData,
        previousLink,
        nextLink,
        showSkip,
    }:
    {
        organizationData?: any,
        previousLink: string,
        nextLink: string,
        showSkip: boolean,
    }
) {
    const {data: session} = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof editOrgFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgFormSchema),
        defaultValues: {
            name: organizationData.name, // required in form schema
            subdomain: organizationData.subdomain, // required in form schema
            raised: organizationData.moneyRaised,
            // deployed: organizationData.moneyDeployed, 
            // budget: organizationData.researchBudget,
        }
    })

    async function onSubmit(values: z.infer<typeof editOrgFormSchema>) {
        setLoading(true)
        if (!session?.user.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        const databaseMap: Partial<Record<keyof typeof values, string>> = {
            raised: "moneyRaised",
            // budget: "researchBudget",
            // deployed: "moneyDeployed",
        };

        Object.entries(values).forEach(([key, value]) => {
            const mappedKey = databaseMap[key as keyof typeof databaseMap]; // Explicitly cast key
            if (mappedKey && value !== undefined && value !== null) {
                formData.append(mappedKey, value.toString());
            }
        });

        try {
            const response = await updateOrganization(organizationData?.id || session?.user.organizationId, formData);
            // mixpanelTrack("Onboarding Completed")
            toast.success("Organization updated successfully!");
            router.push(nextLink);
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

                <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-2">
                        <Button type="button" onClick={() => router.push(previousLink)}>
                            Previous
                        </Button>
                        <Button type="submit" disabled={loading} onClick={() => onSubmit(form.getValues())}>
                            {loading ? <LoadingDots color="#808080"/> : "Finish"}
                        </Button>
                    </div>
                    {showSkip &&
                        <Button variant="ghost" onClick={() => router.push(nextLink)}>
                            Skip for now
                        </Button>
                    }
                </div>
            </form>
        </Form>
    )
}
