import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {FaEllipsis, FaEye, FaRegCircleCheck, FaGlasses, FaGlobe} from "react-icons/fa6";


export default function PublicProfileDropdown({ website }: { website: string | null }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-x-2"
                >
                    <FaEllipsis className="size-6"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                    <a href={website ? website : ""} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <FaGlobe/>
                        <span>View website</span>
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}