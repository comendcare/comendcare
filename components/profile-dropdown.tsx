import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {FaEllipsis, FaEye, FaRegCircleCheck, FaGlasses} from "react-icons/fa6";


export default function ProfileDropdown() {
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
                {/*<DropdownMenuLabel>*/}
                {/*    My account*/}
                {/*</DropdownMenuLabel>*/}
                {/*<DropdownMenuSeparator/>*/}
                <DropdownMenuItem>
                    <FaEye/>
                    <span>Public view</span>
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