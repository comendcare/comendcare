import { LucideProps } from "lucide-react"
import { ReactNode } from "react"

export const PropertyBadge = ({
    children,
    icon: Icon, 
}: {
    children: ReactNode,
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>, 
}) => {
    return (
        <div
            className="text-sm flex flex-row justify-start items-center gap-x-2 border-l-2 border-gray-300 pl-2"
        >
            <Icon className="size-4" />
            {children}
        </div>
    )
}