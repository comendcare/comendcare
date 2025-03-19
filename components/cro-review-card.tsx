"use client"

import React, {useEffect, useRef, useState} from "react";
import {Review, User, Organization, Milestone, Company} from "@prisma/client";
import {StarRatingIndicator} from "@/components/star-rating-indicator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {StarRatingSelector} from "@/components/star-rating-selector";
import {useSession} from "next-auth/react";
import {FaEllipsisVertical, FaFlag, FaLinkSlash, FaPencil, FaTrash} from "react-icons/fa6";
import {editReview, deleteReview} from "@/lib/actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import va from "@vercel/analytics"
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {getMilestones} from "@/lib/fetchers";
import { reviewForm } from "./cro-review-dialog";
import {Button} from "@/components/ui/button";
import {ReviewWithAuthor} from "@/lib/types";


export const CROReviewCard = ({review, cro}: { review: ReviewWithAuthor, cro: Company }) => {
    const router = useRouter()
    const {data: session} = useSession()
    const initializing = useRef(true)
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    const form = useForm<z.infer<typeof reviewForm>>({
        mode: "onChange",
        resolver: zodResolver(reviewForm),
        defaultValues: {
            title: review.title,
            body: review.body,
            rating: review.rating,
            milestone: "",
        },
    });

    async function handleDeleteReview(review: ReviewWithAuthor) {
        try {
            const response = await deleteReview(review);

            if (response.success) {
                va.track("Deleted review");
                router.refresh();
                toast.success("Successfully deleted your review!");
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error(
                "An unexpected error occurred. Please try again later."
            );
            console.error("Error deleting review:", error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                const filteredMilestones = milestonesResponse?.data?.filter(
                    item => (item.status === "INPROGRESS" || item.status === "COMPLETED") && !item.private
                )
                setFetchedMilestones(filteredMilestones as Milestone[])
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

            editReview(cro.id, formData).then((res: any) => {
                if (res.error) {
                    toast.error(res.error);
                } else {
                    va.track("Edited review");
                    router.refresh();
                    toast.success("Successfully edited review!");
                }
            });
        } catch (error) {
            toast.error("An error occurred while editing your review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Avatar className="h-10 w-10 rounded-full">
                            <AvatarImage
                                src={review.author.image || ""}
                                alt={review.author.name || "Author name"}
                            />
                            <AvatarFallback className="rounded-lg">
                                {review.author.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ms-4 font-medium dark:text-white">
                            <p>
                                {review.author.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                {review.organization?.name}
                            </div>
                        </div>
                    </div>

                    <div className="font-medium dark:text-white">
                        <StarRatingIndicator rating={review.rating}/>
                        <div className="flex items-start">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reviewed:{" "}
                                <time dateTime={new Date(review.createdAt).toISOString()}>
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                            </p>
                        </div>
                    </div>
                </div>

                {/*<ul className="flex flex-row space-x-4 text-sm text-gray-500 dark:text-gray-400">*/}
                {/*    <li className="flex items-center">*/}
                {/*        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"*/}
                {/*             viewBox="0 0 20 20">*/}
                {/*            <path*/}
                {/*                stroke="currentColor"*/}
                {/*                strokeLinecap="round"*/}
                {/*                strokeLinejoin="round"*/}
                {/*                strokeWidth="2"*/}
                {/*                d="M4 15V9m4 6V9m4 6V9m4 6V9M2 16h16M1 19h18M2 7v1h16V7l-8-6-8 6Z"*/}
                {/*            />*/}
                {/*        </svg>*/}
                {/*        Apartment with city view*/}
                {/*    </li>*/}
                {/*    <li className="flex items-center">*/}
                {/*        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*             fill="currentColor" viewBox="0 0 20 20">*/}
                {/*            <path*/}
                {/*                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Z"/>*/}
                {/*        </svg>*/}
                {/*        3 nights December 2021*/}
                {/*    </li>*/}
                {/*    <li className="flex items-center">*/}
                {/*        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*             fill="currentColor" viewBox="0 0 20 19">*/}
                {/*            <path*/}
                {/*                d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>*/}
                {/*        </svg>*/}
                {/*        Family*/}
                {/*    </li>*/}
                {/*</ul>*/}
            </div>

            <div className="col-span-2">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {review.title}
                </h4>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                    {review.body}
                </p>
                <aside className="flex items-center mt-3 space-x-4">
                    <a href="#"
                       className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        Helpful
                    </a>

                    <a href="#"
                       className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500 group">
                        Not helpful
                    </a>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger>
                                <FaEllipsisVertical/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {session?.user.id === review.author.id &&
                                    <DialogTrigger asChild>
                                        <DropdownMenuItem>
                                            <FaPencil/>
                                            Edit review
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                }
                                {session?.user.id !== review.author.id &&
                                    <DropdownMenuItem>
                                        <FaFlag/>
                                        Report review
                                    </DropdownMenuItem>
                                }
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                    onClick={() => handleDeleteReview(review)}
                                >
                                    <FaTrash/>
                                    Delete review
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Review</DialogTitle>
                                <DialogDescription>Modify your review below.</DialogDescription>
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
                                                                {fetchedMilestones.length === 0 ?
                                                                    <SelectLabel>
                                                                        {`You don't have any in progress or completed milestones.`}
                                                                    </SelectLabel>
                                                                    : fetchedMilestones.map((m: Milestone, index: number) => (
                                                                        <SelectItem value={m.id} key={index}>
                                                                            {m.title}
                                                                        </SelectItem>
                                                                    ))}
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
                                                        <FaLinkSlash/>
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
                </aside>
            </div>
        </div>
    );
};

