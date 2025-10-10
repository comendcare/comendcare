import logo from "@/public/logos/comend-full-logo.png"
import {createLucideIcon, Facebook, Instagram, Linkedin, Twitter} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {LinkPreview} from "~web/components/link-preview";
import {Separator} from "@/packages/components/ui/separator";
import React from "react";

export const XIcon = createLucideIcon("X", [
    [
        "path",
        {
        d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
        stroke: "none",
        fill: "currentColor",
        },
    ],
]);

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

                        <li className="flex justify-center items-center">
                            <a
                                href="https://twitter.com/comendcare"
                                rel="noreferrer"
                                target="_blank"
                                className="text-gray-700 transition hover:opacity-75 mb-0 -ml-1"
                            >
                                <span className="sr-only">Twitter</span>
                                <XIcon className="size-8" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
