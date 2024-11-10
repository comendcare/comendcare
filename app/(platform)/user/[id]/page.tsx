"use client"
import {useSession} from "next-auth/react";
import {getUser} from "@/lib/actions";
import {useEffect, useState} from "react";
import {User} from "@prisma/client";
import {createDicebearAvatar} from "@/lib/utils";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Loading from "@/app/loading";
import Link from "next/link";
import {FaArrowLeft, FaArrowLeftLong} from "react-icons/fa6";
import UserSettingsDialog from "@/components/user-settings-dialog";

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
            <main className="flex flex-row justify-start items-start space-x-16 w-full max-w-7xl mx-auto m-16">
                <div className="flex flex-col space-y-4">
                    <Link
                        href="/app/profile"
                        className="inline-flex items-center gap-x-2"
                    >
                        <FaArrowLeftLong/>
                        Back to organization
                    </Link>
                    <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                         src={createDicebearAvatar(user.createdAt.toLocaleString() ?? "", 50, 40, "identicon")}
                         alt=""/>
                    <h1>
                        {user.name}
                    </h1>
                    <p>
                        {user.title}
                    </p>
                    <p>
                        Joined {new Date(user.createdAt).toDateString()}
                    </p>
                    <UserSettingsDialog/>
                </div>
                <div>
                    <Tabs defaultValue="posts">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="posts">Posts</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts">

                        </TabsContent>
                        <TabsContent value="password">

                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        )
    } else {
        <Loading/>
    }
}