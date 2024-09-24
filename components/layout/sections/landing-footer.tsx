import logo from "@/public/logos/comend-full-logo.png";
import Image from "next/image";
import Link from "next/link";
import {FaFacebook, FaInstagram, FaLinkedin, FaTwitter} from "react-icons/fa6";


export default function LandingFooter() {
    return (
        <footer className="bg-white">
            <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="text-teal-600">
                        <Image className="w-48 inline" src={logo} alt="Comend Logo"/>
                    </div>

                    <ul className="mt-8 flex justify-start gap-6 sm:mt-0 sm:justify-end">
                        <li>
                            <a
                                href="#"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">Facebook</span>

                                <FaFacebook className="size-8"/>
                            </a>
                        </li>

                        <li>
                            <a
                                href="#"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">Instagram</span>

                                <FaInstagram className="size-8"/>

                            </a>
                        </li>

                        <li>
                            <a
                                href="#"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">LinkedIn</span>

                                <FaLinkedin className="size-8"/>
                            </a>
                        </li>

                        <li>
                            <a
                                href="#"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">Twitter</span>

                                <FaTwitter className="size-8"/>
                            </a>
                        </li>
                    </ul>
                </div>

                {/*<div*/}
                {/*    className="grid grid-cols-1 gap-8 border-t border-gray-100 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:pt-16"*/}
                {/*>*/}
                {/*    <div>*/}
                {/*        <p className="font-medium text-gray-900">Services</p>*/}

                {/*        <ul className="mt-6 space-y-4 text-sm">*/}
                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> 1on1 Coaching </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Company Review </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Accounts Review </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> HR Consulting </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> SEO Optimisation </a>*/}
                {/*            </li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}

                {/*    <div>*/}
                {/*        <p className="font-medium text-gray-900">Company</p>*/}

                {/*        <ul className="mt-6 space-y-4 text-sm">*/}
                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> About </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Meet the Team </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Accounts Review </a>*/}
                {/*            </li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}

                {/*    <div>*/}
                {/*        <p className="font-medium text-gray-900">Helpful Links</p>*/}

                {/*        <ul className="mt-6 space-y-4 text-sm">*/}
                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Contact </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> FAQs </a>*/}
                {/*            </li>*/}

                {/*            <li>*/}
                {/*                <a href="#" className="text-gray-700 transition hover:opacity-75"> Live Chat </a>*/}
                {/*            </li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <nav className="mt-10 text-sm" aria-label="quick links">
                    <div className="-my-1 flex justify-center gap-x-6">
                        <Link
                            href={`${typeof window !== "undefined" ? window.location.origin : ""}/#solutions`}>
                            Terms of Services
                        </Link>
                        <Link href="/about">
                            Privacy Policy
                        </Link>
                    </div>
                </nav>

                <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()}. Comend. All rights reserved.</p>
            </div>
        </footer>
    )
}