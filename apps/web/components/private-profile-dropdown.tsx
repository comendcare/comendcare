"use client"

import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import { Ellipsis, Globe } from "lucide-react";


export default function PrivateProfileDropdown({subdomain}: { subdomain: string | null }) {

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
                    <FaWandMagicSparkles/>
                    <span>Take a tour</span>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
