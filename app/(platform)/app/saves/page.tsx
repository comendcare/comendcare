"use client"

import { PulsatingButton } from "@/components/ui/pulsating-button"
import Image from "next/image"
import {useRouter} from "next/navigation";

export default async function SavesPage() {
    const router = useRouter();

    return (
        <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
            <div className="h-full flex flex-col items-center justify-center py-20">
                <Image
                    alt="No saves"
                    src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No saves"
                    src="https://illustrations.popsy.co/white/digital-nomad.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <div className="flex flex-col justify-center items-center space-y-8">
                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                        {`You do not have any saves yet. Visit the marketplace to save some CROs.`}
                    </p>
                    <PulsatingButton
                        className="bg-black"
                        pulseColor={"#9ca3af"}
                        onClick={() => router.push("/app/marketplace/cro")}
                    >
                        Visit marketplace
                    </PulsatingButton>
                </div>
            </div>
        </main>
    )
}