import { FaTrash } from "react-icons/fa6"
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
        <li key={index} className="flex flex-row gap-2 items-center">
            <div className="h-full w-full grow">
            <Input
                className="h-full"
                placeholder={`Contact name`}
                value={value.name}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        name: e.currentTarget.value
                    })
                }}
            />
            </div>
            <div className="h-full w-full grow">
            <Input
                className="h-full"
                placeholder={`Contact email`}
                value={value.email}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        email: e.currentTarget.value
                    })
                }}
            />
            </div>
            <Button variant="secondary" onClick={deleteElement}>
                <FaTrash />
            </Button>
        </li>
    )
}