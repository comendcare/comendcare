import { FaTrash, FaUser } from "react-icons/fa6"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Prisma } from "@prisma/client"

type ContactType = Prisma.ExternalContactGetPayload<{
    select: { name: true, role: true, email: true }
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
        <li key={index} className="grid grid-cols-[20px_auto_40px] lg:grid-cols-[20px_auto_auto_40px] gap-2 items-center">
            <FaUser className="row-start-1 col-start-1"/>
            <div className="h-full w-full grow row-start-1 col-start-2">
            <Input
                className="h-full"
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
            <div className="h-full w-full grow row-start-2 col-start-2 lg:row-start-1 lg:col-start-3">
            <Input
                className="h-full"
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
            <div className="h-full w-full grow row-start-3 col-start-2 lg:row-start-2 lg:col-start-2 lg:col-span-2">
            <Input
                className="h-full"
                placeholder={`Affiliation`}
                value={value.email}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        email: e.currentTarget.value
                    })
                }}
            />
            </div>
            <Button className="row-start-1 col-start-3 lg:col-start-4" variant="secondary" onClick={deleteElement}>
                <FaTrash />
            </Button>
        </li>
    )
}