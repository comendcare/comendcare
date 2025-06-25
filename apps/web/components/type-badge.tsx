import { Badge } from "@/components/ui/badge"
import { cn } from "@comend/lib/utils"
import { FileText, Megaphone, Star } from "lucide-react"

const style = "h-8 text-sm flex justify-center gap-2 border-none text-blue-dark bg-blue-light"

export const TypeBadge = ({type, iconOnly = false, className}: {
    type: string,
    iconOnly?: boolean,
    className?: string
}) => {

    return (
        <Badge variant="outline" className={cn(iconOnly ? "w-8 p-2 rounded-full" : "", style, className)}>
            <FileText className="h-5 w-5"/>
            {!iconOnly && "Project"}
        </Badge>
    )
}
