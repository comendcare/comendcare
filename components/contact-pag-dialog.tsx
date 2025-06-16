"use client"
import React from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import mixpanel from "mixpanel-browser";
import {toast} from "sonner";
import {Organization} from "@prisma/client";
import {sendPAGContactEmail} from "@/lib/emails";
import { mixpanelTrack, useMixpanelContext } from "@/mixpanel";
import { customerIOTrack, sendCustomerIOContactEmail } from "@/lib/customer-io";

// Validation schema
const contactSchema = z.object({
    name: z.string().min(2, {message: "Name must be at least 2 characters."}),
    email: z.string().email({message: "Please enter a valid email address."}),
    message: z.string().min(10, {message: "Message must be at least 10 characters."}),
});

export default function ContactPAGDialog({organization}: { organization: Organization }) {
    const form = useForm<z.infer<typeof contactSchema>>({
        mode: "onChange",
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });
    const { mixpanelContext } = useMixpanelContext()

    // Track event in Mixpanel
    const trackMixpanelEvent = () => {
        mixpanelTrack("User Contacted Organization", {
            organization: organization.name,
        });
    };

    const onSubmit = async (values: z.infer<typeof contactSchema>) => {
        trackMixpanelEvent();
        toast.success(`Your message to ${organization.name} has been sent!`);
        form.reset();
        try {
            mixpanelTrack("Organization Contacted", {
                "Organization ID": organization.id,
                "Organization Name": organization.name,
                "Organization Email": organization.contactEmail,
                "Contacter Name": values.name,
                "Contacter Email": values.email
            })
            // await customerIOTrack({
            //     userId: mixpanelContext?.distinctId,
            //     event: "pag_contacted",
            //     properties: {
            //         org_id: organization.id,
            //         org_name: organization.name,
            //         org_contact_email: organization.contactEmail,
            //         message: values.message,
            //         contacter_name: values.name,
            //         contacter_email: values.email,
            //         name: organization.name,
            //         email: organization.contactEmail
            //     }
            // })
            const emailPayload = {
                transactional_message_id: "3",
                message_data: {
                    body: {
                        message: values.message,
                        email: organization.contactEmail,
                        name: organization.name,
                        contacter_name: values.name,
                        contacter_email: values.email
                    }
                },
                identifiers: {
                    id: mixpanelContext?.distinctId
                },
                to: organization.contactEmail,
            }
            sendCustomerIOContactEmail(emailPayload)
            // await sendPAGContactEmail({
            //     name: values.name,
            //     email: values.email,
            //     message: values.message,
            //     organizationEmail: organization.contactEmail
            // })
        } catch (error) {
            toast.error(`Failed to send message to ${organization.name}. Please try again.`);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Contact {organization.name}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="message"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Your Message</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Write your message..." rows={6} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <DialogClose>
                        <Button type="submit">Send Message</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </Form>
        </>
    );
}
