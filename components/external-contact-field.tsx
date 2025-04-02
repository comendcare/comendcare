import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Prisma } from "@prisma/client"
import { Trash, User } from "lucide-react"

type ContactType = Prisma.ExternalContactGetPayload<{
    select: { name: true, role: true, email: true, affiliation: true }
}>

export const ExternalContactField = ({
    index,
    value,
    onDelete,
    onValueChange
}: {
    index: number
    value: ContactType
    onDelete: () => void
    onValueChange: (newValue: ContactType) => void
}) => {
    const deleteElement = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onDelete()
    }

    return (
        <li key={index} className="grid grid-cols-[20px_auto_34px] lg:grid-cols-[20px_auto_auto_34px] gap-2 items-center">
            <User className="row-start-1 col-start-1 h-4 w-4"/>
            <div className="h-fit w-full grow row-start-1 col-start-2">
            <Input
                placeholder={`Name`}
                value={value.name}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        name: e.currentTarget.value
                    })
                }}
            />
            </div>
            <div className="h-fit w-full grow row-start-2 col-start-2 lg:row-start-1 lg:col-start-3">
            <Input
                placeholder={`Email`}
                value={value.email}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        email: e.currentTarget.value
                    })
                }}
            />
            </div>
            <div className="h-fit w-full grow row-start-3 col-start-2 lg:row-start-2 lg:col-start-2 lg:col-span-2">
            <Input
                placeholder={`Affiliation`}
                value={value.affiliation || undefined}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        affiliation: e.currentTarget.value
                    })
                }}
            />
            </div>
            <Button className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" variant="ghost" onClick={deleteElement}>
                <Trash />
            </Button>
        </li>
    )
}