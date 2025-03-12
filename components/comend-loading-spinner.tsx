import Image from "next/image"
import logo from "@/public/Full logo.png"
import Spinner from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export default function ComendLoadingSpinner({className = ""}: {className?: string}) {
    return (
        <div className={cn("flex flex-col space-y-8 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-3.5rem)] items-center justify-center", className)}>
            <Spinner className="scale-150" />
            <div className="w-1/6 min-w-40">
                <Image priority src={logo} alt="Comend logo" />
            </div>
        </div>
    )
}
