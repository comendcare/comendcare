import logo from "@/public/logos/comend-full-logo.png"
import {Facebook, Instagram, Linkedin, Twitter} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {LinkPreview} from "~web/components/link-preview";
import {Separator} from "@/packages/components/ui/separator";
import React from "react";

export default function PublicPageFooter() {
    return (
        <footer className="bg-white">
            <Separator className="max-w-7xl mx-auto mt-8"/>
            <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
                {/* Adjust flex and alignment for mobile and larger screens */}
                <div
                    className="flex flex-col items-center space-y-8 sm:grid sm:grid-cols-2 sm:space-y-0">
                    <p className="inline-flex items-center self-start place-self-start justify-start">
                        Made with ❤️ by
                        <LinkPreview url={"https://www.comendcare.com/"} target="_blank">
                            <Image className="w-24 inline" src={logo} alt={"Comend Logo"}/>
                        </LinkPreview>
                    </p>

                    {/* Ensure icons are centered on mobile and justified on larger screens */}
                    <ul className="flex gap-6 place-self-end justify-center">
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
                                <Instagram className="size-8"/>
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
                                <Linkedin className="size-8"/>
                            </a>
                        </li>

                        <li>
                            <a
                                href="https://twitter.com/comendcare"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75"
                            >
                                <span className="sr-only">Twitter</span>
                                <Twitter className="size-8"/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
