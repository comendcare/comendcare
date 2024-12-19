"use client";

import * as React from "react";
import {Check, ChevronsUpDown, PlusCircle} from "lucide-react";
import {useSession} from "next-auth/react";

import {cn} from "@/lib/utils";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {MemberWithOrganization} from "@/app/(platform)/app/layout";
import {FaCity} from "react-icons/fa6";
import {useEffect} from "react";
import {ProfilePhoto} from "./profile-photo";
import {useRouter} from "next/navigation";

interface TeamSwitcherProps {
    isCollapsed: boolean,
    organizations: MemberWithOrganization[];
}

export default function OrganizationSelector({
                                                 isCollapsed,
                                                 organizations,
                                             }: TeamSwitcherProps) {
    const router = useRouter();
    const {data: session, update} = useSession();
    const [open, setOpen] = React.useState(false);
    const [selectedOrganization, setSelectedOrganization] = React.useState(organizations?.[0] || null);

    useEffect(() => {
        if (!organizations || organizations.length === 0) return;

        const matchingOrganization = organizations.find(
            (org) => org.organization.id === session?.user?.organizationId
        );

        setSelectedOrganization(matchingOrganization || organizations[0]);
    }, [organizations, session?.user?.organizationId])

    const handleOrganizationChange = async (org: MemberWithOrganization) => {
        setSelectedOrganization(org);
        setOpen(false);
        await update({
            ...session,
            organizationId: org.organization.id,
        });
        router.refresh()
    };
    console.log(selectedOrganization)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {isCollapsed ? (
                    <Button variant="outline" className="w-[48px]">
                        <div className="flex flex-row items-center justify-between">
                            {/* <Avatar className="h-5 w-5">
                                    <AvatarImage
                                        src={getOrgPhoto(selectedOrganization?.organization)}
                                        alt={selectedOrganization?.organization.name || ""}
                                        className="grayscale"
                                    />
                                    <AvatarFallback>{selectedOrganization?.organization.name?.[0]}</AvatarFallback>
                                </Avatar> */}
                            <ProfilePhoto
                                img={selectedOrganization?.organization?.image}
                                name={selectedOrganization?.organization?.name}
                                className="h-5 w-5"
                            />
                        </div>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select an organization"
                        className={cn("w-full justify-between truncate")}
                    >
                        {/* <Avatar className="mr-2 h-5 w-5">
                                <AvatarImage
                                    src={getOrgPhoto(selectedOrganization?.organization)}
                                    alt={selectedOrganization?.organization.name || ""}
                                    className="grayscale"
                                />
                                <AvatarFallback>{selectedOrganization?.organization.name?.[0]}</AvatarFallback>
                            </Avatar> */}
                        <ProfilePhoto
                            img={selectedOrganization?.organization?.image}
                            name={selectedOrganization?.organization?.name}
                            className="mr-2 h-5 w-5"
                        />
                        <p className="truncate">
                            {selectedOrganization ? selectedOrganization?.organization.name : "Create or join an organization"}
                        </p>
                        <ChevronsUpDown className="ml-auto opacity-50"/>
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    {/*<CommandInput placeholder="Search organization..." />*/}
                    <CommandList>
                        <CommandEmpty>No organization found.</CommandEmpty>
                        <CommandGroup heading="Organizations">
                            {organizations.map((org) => (
                                <CommandItem
                                    key={org.organization.id}
                                    onSelect={() => handleOrganizationChange(org)}
                                    className="w-full flex flex-row justify-between text-sm space-x-2"
                                >
                                    {/* <Avatar className="mr-2 h-5 w-5">
                                            <AvatarImage
                                                src={getOrgPhoto(org?.organization)}
                                                alt={org.organization.name || ""}
                                                className="grayscale"
                                            />
                                            <AvatarFallback>
                                                {org.organization.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar> */}
                                    <div className="flex flex-row">
                                        <ProfilePhoto
                                            img={org?.organization?.image}
                                            name={org?.organization?.name}
                                            className="mr-2 h-5 w-5"
                                        />
                                        {org.organization.name}
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            selectedOrganization?.organization.id ===
                                            org.organization.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator/>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false);
                                    router.push("/app/create/new-organization")
                                }}
                                className="flex flex-row gap-x-2"
                            >
                                <PlusCircle className="h-5 w-5"/>
                                Create or join organization
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
