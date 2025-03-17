import { FaTrash } from "react-icons/fa6"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Prisma } from "@prisma/client"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{
    select: { name: true, link: true }
}>

export const ExternalAttachmentField = ({
    index,
    value,
    onDelete,
    onValueChange
}: {
    index: number
    value: AttachmentType
    onDelete: () => void
    onValueChange: (newValue: AttachmentType) => void
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
                placeholder={`Name`}
                value={value.name || ""}
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
                placeholder={`Url`}
                value={value.link}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    onValueChange({
                        ...value,
                        link: e.currentTarget.value
                    })
                }}
            />
            </div>
            <Button className="w-[40px]" variant="secondary" onClick={deleteElement}>
                <FaTrash />
            </Button>
        </li>
    )
}