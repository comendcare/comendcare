"use client"
import {useSession} from "next-auth/react";
import {getUser} from "@/lib/actions";
import {useEffect, useState} from "react";
import {User} from "@prisma/client";
import {cn, createDicebearAvatar} from "@/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Loading from "@/app/loading";
import Link from "next/link";
import {FaArrowLeft, FaArrowLeftLong} from "react-icons/fa6";
import UserEditSettingsDialog from "@/components/user-edit-settings-dialog";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function UserProfilePage() {
    const {data: session} = useSession()
    const [user, setUser] = useState<User>();

    useEffect(() => {
        async function fetchUserData() {
            if (session?.user?.id) {
                const userData = await getUser(session.user.id);
                if (userData) {
                    setUser(userData);
                }
            }
        }

        fetchUserData();
    }, [session])

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
                            <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                                 src={createDicebearAvatar(user.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                                 alt=""/>
                            <CardTitle>
                                <h1 className="min-w-0 truncate text-4xl font-bold text-gray-900">
                                    {user.name}
                                </h1>
                            </CardTitle>
                            <h2 className="text-xl">
                                {user.title}
                            </h2>
                            <p>
                                Joined {new Date(user.createdAt).toDateString()}
                            </p>
                            <UserEditSettingsDialog/>
                        </CardHeader>
                        <CardContent className="grid gap-8">
                            <h2 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                Organizations
                            </h2>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/01.png" alt="Avatar"/>
                                    <AvatarFallback>OM</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">
                                        olivia.martin@email.com
                                    </p>
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

                        </TabsContent>
                        <TabsContent value="activity">
                            <PAGProfileActivityCard/>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        )
    } else {
        <Loading/>
    }
}
