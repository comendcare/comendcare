import logo from "@/public/logos/comend-full-logo.png"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingFooter() {
    return (
        <footer className="bg-white">
            <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
                {/* Adjust flex and alignment for mobile and larger screens */}
                <div className="flex flex-col items-center space-y-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="text-teal-600">
                        <Image className="w-48" src={logo} alt="Comend Logo" />
                    </div>

                    {/* Ensure icons are centered on mobile and justified on larger screens */}
                    <ul className="flex justify-center gap-6">
                        {/*<li>*/}
                        {/*    <a*/}
                        {/*        href="https://www.facebook.com/comendcare/"*/}
                        {/*        rel="noreferrer"*/}
                        {/*        target="_blank"*/}
                        {/*        className="text-gray-700 transition hover:opacity-75"*/}
                        {/*    >*/}
                        {/*        <span className="sr-only">Facebook</span>*/}
                        {/*        <Facebook className="size-8" />*/}
                        {/*    </a>*/}
                        {/*</li>*/}

                        <li>
                            <a
                                href="https://www.instagram.com/comendcare/"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">Instagram</span>
                                <Instagram className="size-8" />
                            </a>
                        </li>

                        <li>
                            <a
                                href="https://www.linkedin.com/company/comend"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin className="size-8" />
                            </a>
                        </li>

                        {/*<li>*/}
                        {/*    <a*/}
                        {/*        href="https://twitter.com/comendcare"*/}
                        {/*        rel="noreferrer"*/}
                        {/*        target="_blank"*/}
                        {/*        className="text-gray-700 transition hover:opacity-75"*/}
                        {/*    >*/}
                        {/*        <span className="sr-only">Twitter</span>*/}
                        {/*        <Twitter className="size-8" />*/}
                        {/*    </a>*/}
                        {/*</li>*/}
                    </ul>
                </div>

                <nav
                    className="text-center mt-10 text-sm"
                    aria-label="quick links"
                >
                    <div className="-my-1 flex justify-center gap-x-6">
                        <Link href="https://www.librarey.com/terms-of-service">
                            Terms of Services
                        </Link>
                        <Link href="https://comend.notion.site/Librarey-s-Policies-98d960fe48e34b97a5bb5b152266ecc2">
                            Privacy Policy
                        </Link>
                    </div>
                </nav>

                {/* Center align copyright text */}
                <p className="text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()}. Comend. All rights
                    reserved.
                </p>
            </div>
        </footer>
    )
}
