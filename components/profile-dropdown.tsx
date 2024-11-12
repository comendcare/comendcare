import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {FaEllipsis, FaEye, FaRegCircleCheck, FaGlasses} from "react-icons/fa6";


export default function ProfileDropdown({ subdomain }: { subdomain: string | null }) {
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
                    <a href={`http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <FaEye />
                        <span>Public view</span>
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FaGlasses/>
                    <span>Edit visibility</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <FaRegCircleCheck/>
                    <span>Comend verified</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}