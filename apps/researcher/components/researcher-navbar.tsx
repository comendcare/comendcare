import {ResearcherNavbarMenu} from "~researcher/components/researcher-navbar-menu";
import ComendLogo from "./../../../public/logos/comend-logo.png"
import Image from "next/image";
import UserNavbarProfile from "~researcher/components/user-navbar-profile";
import {Suspense} from "react";
import {Skeleton} from "@comend/components/ui/skeleton";
import type {User} from "@prisma/client";
import {FeedbackSheet} from "@comend/components/feedback"
import { Button } from "@comend/components/ui/button";
import { MessageCircle } from "lucide-react";

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
                <nav className="flex justify-between items-center gap-2">
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
                    <FeedbackSheet 
                        className="ml-auto"
                        triggerButton={
                            <Button variant={'ghost'}>
                                <div className="relative">
                                    <MessageCircle className="h-4 w-4"/>
                                </div>
                                {'Message a team member'}
                            </Button>
                        }
                    />
                    <UserNavbarProfile user={user}/>
                </nav>
            </Suspense>
        </div>
    )
}
