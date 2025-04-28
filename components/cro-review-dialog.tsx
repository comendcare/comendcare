"use client"

import React, {useEffect, useRef, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectLabel,
    SelectGroup,
    SelectTrigger,
    SelectValue,
    SelectItem
} from "@/components/ui/select"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {createReview} from "@/lib/actions";
import {Company, Milestone} from "@prisma/client";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {StarRatingSelector} from "@/components/star-rating-selector";
import {getMilestones} from "@/lib/fetchers";
import {useSession} from "next-auth/react";
import {Link2Off, PencilLine} from "lucide-react";
import mixpanel from "mixpanel-browser";
import { MILESTONE_TYPE_OPTIONS } from "@/prisma/seed/seed-options";

export const reviewForm = z.object({
    title: z
        .string({required_error: "Please provide a title"})
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    body: z
        .string({required_error: "Please provide a description"})
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters"),
    rating: z
        .number({required_error: "Please provide a rating"})
        .min(1, "Rating is required"),
    milestone: z
        .string({required_error: "Please provide a milestone"})
});

export default function CROReviewDialog({cro}: { cro: Company }) {
    const {data: session} = useSession()
    const router = useRouter();
    const initializing = useRef(true)
    const [loading, setLoading] = useState(false);
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    const form = useForm<z.infer<typeof reviewForm>>({
        mode: "onChange",
        resolver: zodResolver(reviewForm),
        defaultValues: {
            title: "",
            body: "",
            rating: 0,
            milestone: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }
            // Allow update once form is initialized
            initializing.current = false;
        }

        fetchData()
    }, [])

    const handleFormSubmit = async (values: z.infer<typeof reviewForm>) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            await createReview(cro.id, formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error);
                } else {
                    va.track("Created review")
                    console.log(`response`, res)
                    const milestone = res?.milestones?.[0]?.milestone
                    console.log(`milestone`, milestone)
                    mixpanel.track("Service Provider Review Submtited", {
                        "Service Provider ID": cro.id,
                        "Service Provider Name": cro.title,
                        "Title": res.data.title,
                        "Description": res.data.body,
                        "Rating": res.data.rating,
                        "Milestone Title": milestone?.title,
                        "Milestone ID": milestone?.id,
                        "Milestone Types": (milestone?.types || []).map((type: any) => MILESTONE_TYPE_OPTIONS.find(t => t.id === type.milestoneTypeId)?.label),
                        "Milestone Budget": milestone?.budget
                    })

                    // router.refresh();
                    toast.success("Successfully published review!");
                }
            })
        } catch (error) {
            toast.error("An error occurred while creating your review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {fetchedMilestones.length === 0 ?
                    <HoverCard openDelay={0}>
                        <HoverCardTrigger>
                            <Button
                                variant="cta"
                                className="w-fit"
                                disabled
                            >
                                <PencilLine/>
                                Write a Review
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            To leave a review you must have a research plan.
                        </HoverCardContent>
                    </HoverCard>
                    : <Button
                        variant="cta"
                        className="w-fit"
                    >
                        <PencilLine/>
                        Write a Review
                    </Button>
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit a Review</DialogTitle>
                    <DialogDescription>
                        All fields are required to submit a review.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter a title" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter a description" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rating"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <StarRatingSelector
                                            control={form.control}
                                            name="rating"
                                            totalStars={5}
                                            size={24}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="milestone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{`Associated Milestone`}</FormLabel>
                                    <div className="flex flex-row gap-4">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Link to a milestone"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {
                                                        fetchedMilestones.map((m: Milestone, index: number) => (
                                                            <SelectItem value={m.id} key={index}>
                                                                {m.title}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                form.setValue('milestone', "")
                                            }}
                                            disabled={!field.value}
                                        >
                                            <Link2Off/>
                                        </Button>
                                    </div>
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
