"use client"

import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Company, Service} from "@prisma/client";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {RFP, Option} from "@comend/lib/types"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@comend/components/ui/dialog";
import {Button} from "@comend/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription
} from "@comend/components/ui/form";
import {Textarea} from "@comend/components/ui/textarea";
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import {toast} from "sonner";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import va from "@vercel/analytics";
import {contactCRO} from "@comend/lib/actions";
import MultipleSelector from "@comend/components/ui/multiple-selector";
import {Handshake} from "lucide-react";
import {getRFPs, getServicesOfCompany} from "@comend/lib/fetchers";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/packages/components/ui/select";

export interface CompanyWithServices extends Company {
    services: Service[]
}

export const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

const formSchema = z.object({
    services: z.array(optionSchema).optional(),
    rfps: z.array(optionSchema).optional(),
    timeline: z.string().optional(),
    meetingObjective: z.string().min(10, "Please describe your objective for the meeting")
});

type RequestMeetingFormData = z.infer<typeof formSchema>;

export default function ContactCroDialog({cro}: { cro: CompanyWithServices }) {
    const {data: session} = useSession();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger onClick={(e) => e.preventDefault()}>
                    <DialogTrigger asChild>
                        <Button
                            variant="secondary"
                            className="onborda-request-meeting-button"
                            disabled={!session?.user?.organizationId}
                        >
                            <Handshake className="mr-2" />
                            Request a Meeting
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {!session?.user?.organizationId && (
                    <TooltipContent>
                        <p>Please join an organization to request a meeting.</p>
                    </TooltipContent>
                )}
            </Tooltip>
            <ContactCroDialogContent cro={cro} setOpen={setOpen}/>
        </Dialog>
    );
}

export const ContactCroDialogContent = ({cro, setOpen}: {cro: Company, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const router = useRouter();
    const {data: session} = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedRFPs, setFetchedRFPs] = useState<RFP[]>([])
    const [fetchedServices, setFetchedServices] = useState<Service[]>([])

    const form = useForm<RequestMeetingFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            services: [],
            rfps: [],
            meetingObjective: ""
        }
    });

    const onSubmit = async (values: RequestMeetingFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData()
            formData.set("description", values.meetingObjective)

            // Map form values into FormData
            const data = {
                services: values.services?.map((service) => service.value).join(",") || "",
                rfps: values.rfps?.map((rfp) => rfp.value).join(",") || "",
            };

            // Append data to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value)
                }
            });

            const response = await contactCRO(session?.user.organizationId, cro.id, formData);

            if (response.success) {
                toast.success("Meeting request submitted successfully!");
                mixpanelTrack("Meeting Requested with CRO", {
                    "CRO ID": cro.id,
                    "CRO Name": cro.title,
                });
                va.track("Requested CRO Meeting");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(response.error || "Submission failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {

                const rfpsResponse = await getRFPs(session.user.organizationId, {
                    id: true,
                    title: true,
                    description: true,
                    openTo: true,
                    startDate: true,
                    endDate: true,
                    contacts: true,
                    attachments: true,
                    budget: true,
                    private: true,
                    headerImage: true,
                    pinned: true,
                    milestones: true
                })
                if (rfpsResponse.success && rfpsResponse.data) {
                    setFetchedRFPs(rfpsResponse.data || [])
                }

                const fetchedServices = await getServicesOfCompany(cro.id, {
                    id: true,
                    name: true,
                    description: true,
                })
                if (fetchedServices.success && fetchedServices.data) {
                    setFetchedServices(fetchedServices.data)
                }
            }

            form.trigger()

        }

        init()

    }, [])

    return (
        <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
            <DialogHeader>
                <DialogTitle>Request a Meeting with {cro.title}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="rfps"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormLabel>
                                    Open RFPs
                                </FormLabel>
                                <FormDescription className="flex items-center">
                                    {`Is there an RFP you’d like to attach to this service provider?`}
                                </FormDescription>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value?.map(rfp => ({
                                            ...rfp,
                                            value: rfp.value,
                                            label: rfp.label
                                        } as Option))}
                                        onChange={field.onChange}
                                        defaultOptions={fetchedRFPs.map(rfp => ({
                                            ...rfp,
                                            value: rfp.id,
                                            label: rfp.title
                                        } as Option))}
                                        options={fetchedRFPs.map(rfp => ({
                                            ...rfp,
                                            value: rfp.id,
                                            label: rfp.title
                                        } as Option))}
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Link RFPs"
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage className="text-primary"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="services"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>
                                    Services requested
                                </FormLabel>
                                <FormDescription className="flex items-center">
                                    {`What types of genetic effects are you investigating? Select all that apply.`}
                                </FormDescription>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        defaultOptions={fetchedServices.map(service => ({
                                            ...service,
                                            value: service.id,
                                            label: service.name
                                        } as Option))}
                                        options={fetchedServices.map(service => ({
                                            ...service,
                                            value: service.id,
                                            label: service.name
                                        } as Option))}
                                        placeholder="Select categories that apply to you..."
                                        hidePlaceholderWhenSelected={true}
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                        maxSelected={fetchedServices?.length}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeline"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Timeline</FormLabel>
                                <FormDescription>When would you like this meeting?</FormDescription>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an approximate time" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1-3">
                                            1-3 months
                                        </SelectItem>
                                        <SelectItem value="4-6">
                                            4-6 months
                                        </SelectItem>
                                        <SelectItem value="6+">
                                            6+ months
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="meetingObjective"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Meeting Objective</FormLabel>
                                <FormDescription>What would you like to get out of this meeting?</FormDescription>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g. Understand timeline, pricing, or team experience..." {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    )
}