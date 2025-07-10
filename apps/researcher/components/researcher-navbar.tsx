import {ResearcherNavbarMenu} from "~provider/components/researcher-navbar-menu";
import ComendLogo from "@/public/logos/comend-logo.png"
import Image from "next/image";
import UserNavbarProfile from "~provider/components/user-navbar-profile";


export function ResearcherNavbar() {
    return (
        <nav className="w-full border-b p-4 flex justify-between items-center">
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
            <UserNavbarProfile/>
        </nav>
    )
}
