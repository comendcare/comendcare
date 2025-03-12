import Image from "next/image"
import logo from "@/public/Full logo.png"
import Spinner from "@/components/ui/spinner"

export default function ComendLoadingSpinner() {
    return (
        <div className="flex flex-col space-y-8 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-3.5rem)] items-center justify-center">
            <Spinner className="scale-150" />
            <div className="w-1/6 min-w-40">
                <Image priority src={logo} alt="Comend logo" />
            </div>
        </div>
    )
}
