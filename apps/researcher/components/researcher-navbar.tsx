import {ResearcherNavbarMenu} from "~researcher/components/researcher-navbar-menu";
import ComendLogo from "@/public/logos/comend-logo.png"
import Image from "next/image";
import UserNavbarProfile from "~researcher/components/user-navbar-profile";


export function ResearcherNavbar() {
    return (
        <nav className="w-full sticky top-0 z-50 border-b p-4 flex justify-between items-center bg-white">
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
