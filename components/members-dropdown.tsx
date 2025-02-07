"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {MemberWithUser} from "@/lib/types";
import {deleteMember, updateMember} from "@/lib/actions";
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

const formSchema = z.object({
    title: z.string().optional().or(z.literal("")), // Allow title to be empty or null
})

export default async function MembersDropdown({member}: { member: MemberWithUser }) {
    const session = useSession()

    const form = useForm<z.infer<typeof formSchema>>({
        mode: "onChange",
        resolver: zodResolver(formSchema),
        // defaultValues: defaultOrganizationValues
    })

    async function onEditMembershipSubmit(values: z.infer<typeof formSchema>) {
        if (session?.data?.user.organizationId) {
            const response = await updateMember(member.id, values)

            if (response.success && response.data) {
                toast.success(`Successfully updated your membership.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    async function revokeMembership(member: MemberWithUser) {
        if (session?.data?.user.organizationId) {
            const response = await deleteMember(member.id)

            if (response.success && response.data) {
                toast.success(`Successfully deleted ${member.user.name}'s membership.`)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    return (
        <Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <FaEllipsis/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {
                        session.data?.user.id === member.user.id &&
                        <DialogTrigger asChild>
                            <DropdownMenuItem>
                                <FaUserPen/>
                                Edit membership
                            </DropdownMenuItem>
                        </DialogTrigger>
                    }

                    <DropdownMenuItem
                        onClick={() => revokeMembership(member)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <FaUserXmark/>
                        Revoke membership
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit membership
                    </DialogTitle>
                    <DialogDescription>
                        Edit your membership details here.
                    </DialogDescription>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onEditMembershipSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormDescription>Your role or title at your patient organization.</FormDescription>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Save</Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
