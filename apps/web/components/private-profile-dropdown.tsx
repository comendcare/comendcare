"use client"

import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@comend/components/ui/dropdown-menu";
import {Button} from "@comend/components/ui/button";
import { Ellipsis, Globe } from "lucide-react";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { useOnborda } from "./onborda/OnbordaContext";


export default function PrivateProfileDropdown({subdomain}: { subdomain: string | null }) {
    const { startOnborda } = useOnborda()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="block xl:hidden gap-x-2"
                >
                    <Ellipsis className="size-6"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                    <a href={`http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank"
                       rel="noopener noreferrer" className="flex items-center gap-2">
                        <Globe />
                        <span>Public view</span>
                    </a>
                </DropdownMenuItem>
                {/*<DropdownMenuItem>*/}
                {/*    <FaGlasses/>*/}
                {/*    <span>Edit visibility</span>*/}
                {/*</DropdownMenuItem>*/}
                {/*<DropdownMenuItem>*/}
                {/*    <FaRegCircleCheck/>*/}
                {/*    <span>Comend verified</span>*/}
                {/*</DropdownMenuItem>*/}
                {/* <DropdownMenuItem
                    onClick={() => {
                        startOnborda('organization-profile-tour')
                    }}
                >
                    <MagicWandIcon/>
                    <span>Take a tour</span>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
