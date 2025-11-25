import {ResearcherNavbarMenu} from "~researcher/components/researcher-navbar-menu";
import ComendLogo from "./../../../public/logos/comend-logo.png"
import Image from "next/image";
import UserNavbarProfile from "~researcher/components/user-navbar-profile";
import {Suspense} from "react";
import {Skeleton} from "@comend/components/ui/skeleton";
import type {User} from "@prisma/client";


export function ResearcherNavbar({user}: {user: Partial<User>}) {
    return (
        <div className="w-full sticky top-0 z-50 border-b p-4 bg-white">
            <Suspense fallback={
                <nav className="flex justify-between items-center">
                    <div className="flex items-center space-x-8">
                        <Skeleton className="w-8 h-8 rounded"/>
                        <div className="flex space-x-4">
                            <Skeleton className="h-6 w-20"/>
                            <Skeleton className="h-6 w-20"/>
                            <Skeleton className="h-6 w-20"/>
                        </div>
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full"/>
                </nav>
            }>
                <nav className="flex justify-between items-center">
                    <div className="flex justify-start items-center space-x-8">
                        <Image
                            src={ComendLogo}
                            width={100}
                            height={100}
                            alt="Comend Logo"
                            className="w-8 h-auto"
                        />

                        <ResearcherNavbarMenu/>
                    </div>
                    <UserNavbarProfile user={user}/>
                </nav>
            </Suspense>
        </div>
    )
}
