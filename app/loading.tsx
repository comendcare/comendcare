import Image from 'next/image'
import logo from "@/public/RareSearch Logo.svg"
import Spinner from "@/components/ui/spinner";

export default function Loading() {
    return (
        <div className="flex flex-col space-y-8 min-h-screen items-center justify-center">
            <Spinner className="scale-150"/>
            <div className="w-1/6">
                <Image
                    priority
                    src={logo}
                    alt="Comend logo"
                />
            </div>
        </div>
    );
}