"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {MemberWithUser} from "@/lib/types";
import {deleteMember, leaveOrganization, updateMember} from "@/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {FaEllipsis, FaUserPen, FaUserXmark} from "react-icons/fa6";
import {useSession} from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {revalidatePath} from "next/cache";
import {useEffect, useState} from "react";
import {getAllMembershipsFromUserId, getInvitations, getOrganizationFromOrganizationId, getUser} from "@/lib/fetchers";
import {MembershipWithOrganization} from "@/lib/types";


const formSchema = z.object({
    title: z.string().optional().or(z.literal("")), // Allow title to be empty or null
    role: z.enum(["admin", "owner"], {message: "Role must be either Admin or Owner."}),
})

export default async function MembersDropdown({member}: { member: MemberWithUser }) {
    const {data: session, update} = useSession()
    console.log(session)

    const form = useForm<z.infer<typeof formSchema>>({
        mode: "onChange",
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: member.title || "",
            role: member.role as z.infer<typeof formSchema>["role"],
        }
    })

    useEffect(() => {
        async function fetchOrgData() {
            if (session) {
                try {
                    const response = await getAllMembershipsFromUserId(session.user.id);

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error("Error fetching organizations:", error);
                    toast.error("Couldn't get organizations");
                }
            }
        }

        fetchOrgData()
    }, [session]);

    async function onEditMembershipSubmit(values: z.infer<typeof formSchema>) {
        if (session?.user.organizationId) {
            const response = await updateMember(member.id, values)

            if (response.success && response.data) {
                toast.success(`Successfully updated your membership.`)

                if (session.user.id === member.user.id) {
                    await update({
                        user: {
                            ...session.user,  // Keep all existing properties intact
                            membership: {
                                ...session.user.membership, // Preserve existing membership details
                                title: values.title,
                                role: values.role
                            }
                        }
                    });
                }
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    async function revokeMembership(member: MemberWithUser) {
        if (session?.user.organizationId) {
            const response = await deleteMember(member.id)

            if (response.success && response.data) {
                toast.success(`Successfully deleted ${member.user.name}'s membership.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    const handleLeaveOrganization = async () => {
        try {
            const response = await leaveOrganization(session, session?.user.organizationId || "");

            if (session && response.success) {
                // Fetch the latest memberships after leaving
                const updatedMembershipsResponse = await getAllMembershipsFromUserId(session.user.id);

                if (updatedMembershipsResponse.success && updatedMembershipsResponse.data) {
                    if (updatedMembershipsResponse.data.length > 0) {
                        // Assign to another membership (pick the first one)
                        const newMembership = updatedMembershipsResponse.data[0];

                        await update({
                            user: {
                                ...session?.user,
                                organizationId: newMembership.organizationId,
                                membership: newMembership,
                            },
                        });

                        toast.success(`Switched to ${newMembership.organization?.name || "another organization"} successfully.`);
                    }
                } else {
                    // No other memberships left, reset to null
                    await update({
                        user: {
                            ...session?.user,
                            organizationId: null,
                            membership: null,
                        },
                    });

                    toast.success("Removed from Organization successfully.");
                }
            } else {
                toast.error("Failed to leave organization. Please try again.");
            }
        } catch (error) {
            console.error("Error leaving organization:", error);
            toast.error("An error occurred. Please try again later.");
        }
    };

    const canEditMembership = session?.user?.id === member?.user?.id || session?.user?.membership?.role === "owner";
    const canLeaveOrganization = session?.user?.id === member?.user?.id;
    const canRevokeMembership = session?.user?.membership?.role === "owner" && session?.user?.id !== member?.user?.id;

    const showDropdownTrigger = canEditMembership || canLeaveOrganization || canRevokeMembership;

    if (!showDropdownTrigger) return null;

    return (
        <Dialog>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                    <FaEllipsis/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {
                        (session?.user?.id === member?.user?.id || session?.user?.membership?.role === "owner") && (
                            <DialogTrigger asChild>
                                <DropdownMenuItem>
                                    <FaUserPen/>
                                    Edit membership
                                </DropdownMenuItem>
                            </DialogTrigger>
                        )
                    }

                    {
                        session?.user?.id === member?.user?.id ? (
                            // Case 1: The current user is viewing their own membership
                            <DropdownMenuItem
                                onClick={handleLeaveOrganization}
                                className="text-red-600 hover:text-red-800"
                            >
                                <FaUserXmark/>
                                Leave organization
                            </DropdownMenuItem>
                        ) : session?.user?.membership?.role === "owner" ? (
                            // Case 2: The current user is an owner and viewing someone else's membership
                            <DropdownMenuItem
                                onClick={() => revokeMembership(member)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <FaUserXmark/>
                                Revoke membership
                            </DropdownMenuItem>
                        ) : null // Case 3: The user is neither the owner nor the same user, show nothing
                    }
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader className="flex flex-col space-y-4">
                    <div>
                        <DialogTitle>
                            Edit membership
                        </DialogTitle>
                        <DialogDescription>
                            Edit your membership details here.
                        </DialogDescription>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onEditMembershipSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormDescription>Your title at your patient organization.</FormDescription>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {
                                session?.user?.membership?.role === "owner" &&
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormDescription>
                                                Choose the role for this organization member.
                                            </FormDescription>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="owner">Owner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            }

                            <Button type="submit">Save</Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
