import { cn } from "@/packages/lib/utils"
import { LucideProps } from "lucide-react"
import { ReactNode } from "react"

export const PropertyBadge = ({
    children,
    icon: Icon, 
    className,
}: {
    children: ReactNode,
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>, 
    className?: string,
}) => {
    return (
        <div
            className={cn("text-sm flex flex-row justify-start items-center gap-x-2 border-l-2 border-gray-300 pl-2", className)}
        >
            <Icon className="size-4" />
            {children}
        </div>
    )
}