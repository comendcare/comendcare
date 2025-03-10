"use client"

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/lib/actions";
import { Company } from "@prisma/client";
import { toast } from "sonner";
import va from "@vercel/analytics";
import { useRouter } from "next/navigation";
import {StarRatingSelector} from "@/components/star-rating-selector";
import {FaPenAlt} from "react-icons/fa";

export default function CROReviewDialog({ cro }: { cro: Company }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const reviewForm = z.object({
        title: z
            .string({ required_error: "Please provide a title" })
            .min(1, "Title is required")
            .max(100, "Title must be less than 100 characters"),
        body: z
            .string({ required_error: "Please provide a description" })
            .min(1, "Description is required")
            .max(500, "Description must be less than 500 characters"),
        rating: z.number({ required_error: "Please provide a rating" }),
    });

    const form = useForm<z.infer<typeof reviewForm>>({
        mode: "onChange",
        resolver: zodResolver(reviewForm),
        defaultValues: { title: "", body: "" },
    });

    const handleFormSubmit = async (values: z.infer<typeof reviewForm>) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            createReview(cro.id, formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error);
                } else {
                    va.track("Created review");
                    router.refresh();
                    toast.success("Successfully published review!");
                }
            });
        } catch (error) {
            toast.error("An error occurred while creating your review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="w-fit"
                >
                    <FaPenAlt/>
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit a Review</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter a title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter a description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <StarRatingSelector control={form.control} name="rating" totalStars={5} size={24} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Review"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
