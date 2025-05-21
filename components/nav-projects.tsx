"use client"

import {
    FolderIcon,
    MoreHorizontalIcon,
    Trash,
    ShareIcon,
    type LucideIcon,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import CreatePharmaProjectDialog from "@/components/create-pharma-project-dialog";
import { usePathname } from "next/navigation"
import {deletePharmaProject, removeEmailFromWhitelist} from "@/lib/actions";
import {toast} from "sonner";

export function NavProjects({
                                items,
                            }: {
    items: {
        name: string
        url: string
        icon: LucideIcon
    }[]
}) {
    const { isMobile } = useSidebar()
    const pathname = usePathname()

    const onDeleteClick = async () => {
        try {
            const id = pathname.split("/").pop();

            const response = await deletePharmaProject(id);

            if (response.success) {
                toast.success("Successfully deleted pharma project.");
            } else {
                toast.error(response.error || "An error occurred while deleting pharma project.");
            }
        } catch (error) {
            console.error("Pharma project deletion error:", error);
            toast.error("An error occurred while deleting email.");
        }
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = pathname === item.url

                    return (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                                asChild
                                className={isActive ? "bg-blue-light text-primary" : ""}
                            >
                                <a href={item.url} className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction
                                        showOnHover
                                        className="rounded-sm data-[state=open]:bg-accent"
                                    >
                                        <MoreHorizontalIcon />
                                        <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-24 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align={isMobile ? "end" : "start"}
                                >
                                    <DropdownMenuItem>
                                        <FolderIcon />
                                        <span>Open</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ShareIcon />
                                        <span>Share</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDeleteClick}>
                                        <Trash />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    )
                })}
                <SidebarMenuItem>
                    <CreatePharmaProjectDialog />
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}
