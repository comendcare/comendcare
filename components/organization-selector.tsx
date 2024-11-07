import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {useSession} from "next-auth/react";
import {FaCity} from "react-icons/fa6";
import {Member, Organization} from "@prisma/client";


type MemberWithOrganization = Member & {
    organization: Organization
};

export default function OrganizationSelector({isCollapsed, organizations}: {
    isCollapsed: boolean,
    organizations: MemberWithOrganization[]
}) {
    const {data: session, update} = useSession()
    return isCollapsed ? (
        <Select
            defaultValue={session?.user.organizationId || ""}
            onValueChange={async (value) => {
                console.log(`org changed`, value)
                await update({
                    ...session,
                    organizationId: value
                })
            }}
        >
            <SelectTrigger className="w-[48px]">
                <div className="flex flex-row items-center justify-between">
                    <FaCity/>
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {organizations?.map(org => (
                        <SelectItem
                            key={org.organization.id}
                            value={org.organization.id}>
                            {org.organization.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    ) : (
        <Select
            defaultValue={session?.user.organizationId || ""}
            onValueChange={async (value) => {
                console.log(`org changed`, value)
                await update({
                    ...session,
                    organizationId: value
                })
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={
                    <div className="flex flex-row items-center justify-between gap-x-2">
                        <FaCity/>
                        Organization
                    </div>
                }/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {organizations?.map(org => (
                        <SelectItem
                            key={org.organization.id}
                            value={org.organization.id}
                        >
                            {org.organization.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}