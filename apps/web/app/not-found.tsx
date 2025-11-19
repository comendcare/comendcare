import Image from "next/image"
import Link from "next/link"
import {buttonVariants} from "@comend/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            {/* Light mode illustration */}
            <Image
                alt="Page not found"
                src="https://illustrations.popsy.co/gray/falling.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            {/* Dark mode illustration */}
            <Image
                alt="Page not found"
                src="https://illustrations.popsy.co/white/falling.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-center space-y-8">
                <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                    {`Oops! This page doesn't exist.`}
                </p>
                <Link
                    href="/"
                    className={buttonVariants({variant: "default"})}
                >
                    Return Home
                </Link>
            </div>
        </main>
    )
}
