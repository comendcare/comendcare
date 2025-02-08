"use client"
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {Organization, User, Invitation} from "@prisma/client";
import {cn} from "@/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Loading from "@/app/loading";
import Link from "next/link";
import {FaArrowLeft, FaArrowLeftLong} from "react-icons/fa6";
import UserEditSettingsDialog from "@/components/user-edit-settings-dialog";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "sonner";
import {
    getAllMembershipsFromUserId,
    getInvitations,
    getOrganizationFromOrganizationId,
    getUser
} from "@/lib/fetchers";
import {ProfilePhoto} from "@/components/profile-photo";
import {Button} from "@/components/ui/button"
import {acceptInvitation} from "@/lib/actions";
import Image from "next/image"
import {useRouter} from "next/navigation";

type InvitationWithOrganization = Invitation & {
    organization?: Organization | null; // Optional because the organization might be null if not fetched
};

export default function UserProfilePage() {
    const router = useRouter();
    const {data: session, update, status} = useSession()
    const [user, setUser] = useState<User>();
    const [orgs, setOrgs] = useState<Organization[]>();
    const [invitations, setInvitations] = useState<InvitationWithOrganization[]>();

    useEffect(() => {
        async function fetchUserData() {
            if (session?.user?.id) {
                const response = await getUser(session.user.id);
                if (response.success) {
                    const userData = response.data
                    setUser(userData);
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            }
        }

        async function fetchOrgData() {
            if (session) {
                try {
                    const response = await getAllMembershipsFromUserId(session.user.id);

                    // Map the response to the correct structure if needed
                    if (response.success) {
                        const organizations = response.data?.map((item: {
                            organization: Organization
                        }) => item.organization)
                        setOrgs(organizations);
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

        async function fetchInvitationData() {
            if (!session?.user?.email && status !== "loading") {
                console.error("User email is not available in the session.");
                toast.error("Session email is missing. Unable to fetch invitations.");
                return;
            }

            try {
                const response = await getInvitations();

                if (response.success && response.data) {
                    const invitationsWithDetails = await Promise.all(
                        response.data.map(async (invitation) => {
                            const orgResponse = await getOrganizationFromOrganizationId(invitation.organizationId);
                            if (orgResponse.success) {
                                return {
                                    ...invitation,
                                    organization: orgResponse.data,
                                };
                            } else {
                                console.error(orgResponse.error);
                                toast.error(`Could not fetch organization details for ID ${invitation.organizationId}`);
                                return { ...invitation, organization: null };
                            }
                        })
                    );

                    setInvitations(invitationsWithDetails);
                } else if (response.error) {
                    console.error(response.error);
                    toast.error(response.error);
                } else {
                    console.error("Unexpected response structure:", response);
                    toast.error("Couldn't fetch invitations. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching invitations:", error);
                toast.error("An unexpected error occurred while fetching invitations.");
            }
        }

        fetchUserData()
        fetchOrgData()
        fetchInvitationData()
    }, [session])

    async function handleAcceptInvitation(invitationId: string) {
        try {
            const response = await acceptInvitation(invitationId);

            if (response.success && response.data) {
                toast.success("Invitation accepted successfully!");
                // Remove the accepted invitation from the list
                setInvitations((prevInvitations) =>
                    prevInvitations?.filter((invitation) => invitation.id !== invitationId)
                );
                await update({
                    ...session,
                    organizationId: response.data.organizationId,
                })
                router.refresh()
            } else {
                toast.error(response.error || "Failed to accept the invitation.");
            }
        } catch (error) {
            console.error("Error accepting invitation:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    }

    if (user) {
        return (
            <main className="grid grid-cols-3 gap-x-16 w-full h-full max-w-7xl mx-auto p-16">
                <div className="col-span-1 h-full flex flex-col space-y-4">
                    <Link
                        href="/app/profile"
                        className="inline-flex items-center gap-x-2"
                    >
                        <FaArrowLeftLong/>
                        Back to organization
                    </Link>

                    <Card>
                        <CardHeader>
                            {/* <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                 src={getUserPhoto(user, session)}
                                 alt=""/> */}
                            <ProfilePhoto
                                img={user?.image}
                                name={user?.name}
                                textSize="large"
                                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                            />
                            <CardTitle>
                                <h1 className="min-w-0 truncate text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h1>
                            </CardTitle>
                            <p>
                                Joined {new Date(user.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            </p>
                            <UserEditSettingsDialog/>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <h2 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Organizations
                                </h2>
                                <div className="flex flex-col items-start gap-4">
                                    {orgs && (
                                        orgs.length > 0 ? orgs?.map((org) =>
                                            <div key={org.id} className="flex items-center gap-4">
                                                <Avatar className="hidden h-9 w-9 sm:flex">
                                                    <AvatarImage src="/avatars/01.png" alt="Avatar"/>
                                                    <AvatarFallback>OM</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-1">
                                                    <>
                                                        <p className="text-sm font-medium leading-none">
                                                            {org.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {`${org.subdomain}.comend.io`}
                                                        </p>
                                                    </>
                                                </div>
                                            </div>
                                        ) : <div className="flex flex-col space-y-2 text-left">
                                            <h3 className="scroll-m-20 text-md tracking-tight font-semibold">
                                                {`No Organizations Yet`}
                                            </h3>
                                            <p>
                                                {`You aren't part of any organizations yet.`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <h2 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Invitations
                                </h2>
                                <div className="flex items-center gap-4">
                                    {invitations && (
                                        invitations.length > 0 ? invitations?.map((invitation) =>
                                            <>
                                                <Avatar className="hidden h-9 w-9 sm:flex">
                                                    <AvatarImage src="/avatars/01.png" alt="Avatar"/>
                                                    <AvatarFallback>OM</AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {invitation.organization?.name || "Unknown Organization"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {`${invitation.organization?.subdomain || "unknown"}.comend.io`}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="default"
                                                    onClick={() => handleAcceptInvitation(invitation.id)}
                                                >
                                                    Accept
                                                </Button>
                                            </>
                                        ) : <div className="flex flex-col space-y-2 text-left">
                                            <h3 className="scroll-m-20 text-md tracking-tight font-semibold">
                                                {`No Invitations Yet`}
                                            </h3>
                                            <p>
                                                {`You don't have any pending invitations.`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-2 w-full">
                    <Tabs defaultValue="feed">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="feed">
                                Feed
                            </TabsTrigger>
                            <TabsTrigger value="activity">
                                Activity
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="feed">
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <Image
                                    alt="No organization"
                                    src="https://illustrations.popsy.co/gray/success.svg"
                                    width={400}
                                    height={400}
                                    className="dark:hidden"
                                />
                                <Image
                                    alt="No organization"
                                    src="https://illustrations.popsy.co/white/success.svg"
                                    width={400}
                                    height={400}
                                    className="hidden dark:block"
                                />
                                <div className="flex flex-col justify-center items-center space-y-8">
                                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                                        {`Coming soon!`}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="activity">
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <Image
                                    alt="No organization"
                                    src="https://illustrations.popsy.co/gray/success.svg"
                                    width={400}
                                    height={400}
                                    className="dark:hidden"
                                />
                                <Image
                                    alt="No organization"
                                    src="https://illustrations.popsy.co/white/success.svg"
                                    width={400}
                                    height={400}
                                    className="hidden dark:block"
                                />
                                <div className="flex flex-col justify-center items-center space-y-8">
                                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                                        {`Coming soon!`}
                                    </p>
                                </div>
                            </div>
                            {/*<PAGProfileActivityCard/>*/}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        )
    } else {
        <Loading/>
    }
}
