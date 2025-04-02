import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Prisma } from "@prisma/client"
import { Trash } from "lucide-react"

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
            <div className="w-full grow">
            <Input
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
            <div className="w-full grow">
            <Input
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
            <Button className="h-full w-[34px]" variant="ghost" onClick={deleteElement}>
                <Trash />
            </Button>
        </li>
    )
}