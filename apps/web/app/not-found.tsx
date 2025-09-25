import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
    return (
        <main className="flex gap-8 flex-col w-full h-full justify-center items-center mx-auto">
            <div className="h-full flex flex-col items-center justify-center py-20">
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
                        className="rounded-2xl px-6 py-3 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 font-medium hover:opacity-90 transition"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    )
}
