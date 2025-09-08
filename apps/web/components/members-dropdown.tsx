"use client"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {MemberWithUser} from "@comend/lib/types";
import {deleteMember, leaveOrganization, updateMemberWithOwnerPermission, updateMemberWithMemberPermission} from "@comend/lib/actions";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@comend/components/ui/dropdown-menu";
import {useSession} from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog"
import {Button} from "@comend/components/ui/button"
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@comend/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import {useEffect, useState} from "react";
import {getAllMembershipsFromUserId, getMembers} from "@comend/lib/fetchers";
import {MembershipWithOrganization} from "@comend/lib/types";
import {Ellipsis, Pencil, UserX} from "lucide-react";
import {useRouter} from "next/navigation";
import { mixpanelTrack } from "@comend/lib/mixpanel";

const formSchema = z.object({
    title: z.string().optional().or(z.literal("")), // Allow title to be empty or null
    role: z.enum(["member", "owner"], {message: "Role must be either Member or Owner."}),
})


export default function MembersDropdown({member}: { member: MemberWithUser }) {
    const router = useRouter()
    const {data: session, update} = useSession()
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLastOwner, setIsLastOwner] = useState(false)

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
                    const response = await getMembers(session.user.organizationId, {
                        id: true,
                        role: true,
                        title: true,
                        email: true,
                        user: true,
                    });

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                        const currentOrgId = session.user.organizationId;
                        const currentOrgMemberships = response.data.filter(
                            (m: MembershipWithOrganization) => m.organizationId === currentOrgId
                        );
                        const ownerCount = currentOrgMemberships.filter((m) => m.role === "owner").length;

                        if (ownerCount === 1 && session.user.id === member.user.id && member.role === "owner") {
                            setIsLastOwner(true);
                        }
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
    }, [session, member]);

    async function onEditMembershipSubmit(values: z.infer<typeof formSchema>) {
        if (!session?.user.organizationId) return;

        const res = session.user.membership?.role === "owner"
            ? await updateMemberWithOwnerPermission(session.user.organizationId, member.id, values)
            : await updateMemberWithMemberPermission(session.user.organizationId, member.id, values);

        if (!res.success) {
            console.error(res.error); toast.error(res.error); return;
        }

        mixpanelTrack("Membership Updated", {
            "Member Name": res.data.user.name,
            "Member Email": res.data.user.email,
            "Title": res.data.title,
            "Role": res.data.role,
        });

        toast.success(`Successfully updated ${session.user.id === member.user.id ? "your" : `${member.user.name}'s`} membership.`);
        setIsDialogOpen(false);
        router.refresh();
    }

    async function revokeMembership(member: MemberWithUser) {
        if (!session?.user.organizationId) return;

        const res = await deleteMember(session.user.organizationId, member.id);
        if (!res.success) {
            console.error(res.error); toast.error(res.error); return;
        }

        mixpanelTrack("Membership Revoked", {
            "Member Name": res.data.user.name,
            "Member Email": res.data.user.email,
            "Title": res.data.title,
            "Role": res.data.role,
        });

        toast.success(`Successfully deleted ${member.user.name}'s membership.`);
        router.refresh();
    }

    const handleLeaveOrganization = async () => {
        if (isLastOwner) {
            toast.error("You are the last owner and cannot leave the organization. Please assign another owner first.");
            return;
        }
        if (!session?.user.organizationId) return;

        const res = await leaveOrganization(session.user.organizationId)
        if (!res.success) {
            console.log(res.error);
            toast.error(`Failed to leave organization. ${res.error}.`);
            return;
        }

        toast.success("Removed from organization successfully.");
        await update({})
        router.refresh();
        router.push("/app/profile");
    };

    const canEditMembership = session?.user?.id === member?.user?.id || session?.user?.membership?.role === "owner";
    const canLeaveOrganization = session?.user?.id === member?.user?.id;
    const canRevokeMembership = session?.user?.membership?.role === "owner" && session?.user?.id !== member?.user?.id;

    const showDropdownTrigger = canEditMembership || canLeaveOrganization || canRevokeMembership;

    if (!showDropdownTrigger) return null;

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);

                if (!open) {
                    // Reset form values when dialog is closed
                    form.reset({
                        title: member.title || "",
                        role: member.role as z.infer<typeof formSchema>["role"],
                    });
                }
            }}
        >
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                    <Ellipsis/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {
                        (session?.user?.id === member?.user?.id || session?.user?.membership?.role === "owner") && (
                            <DialogTrigger asChild>
                                <DropdownMenuItem>
                                    <Pencil/>
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
                                <UserX/>
                                Leave organization
                            </DropdownMenuItem>
                        ) : session?.user?.membership?.role === "owner" ? (
                            // Case 2: The current user is an owner and viewing someone else's membership
                            <DropdownMenuItem
                                onClick={() => revokeMembership(member)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <UserX/>
                                Remove membership
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
                                                {isLastOwner
                                                    ? "You cannot change your role because you are the last owner. Every organization must have at least one owner."
                                                    : <>Choose the role for this organization member.</>}

                                            </FormDescription>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}
                                                    disabled={isLastOwner}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        {field.value ? (
                                                            <span>{field.value === "owner" ? "Owner" : "Member"}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Select a role</span>
                                                        )}
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="member">
                                                        <p>
                                                            Member
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Can view and edit.
                                                        </p>
                                                    </SelectItem>
                                                    <SelectItem value="owner">
                                                        <p>
                                                            Owner
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Can view, edit, and manage organization members.
                                                        </p>
                                                    </SelectItem>
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
