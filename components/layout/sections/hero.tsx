"use client";
import {Badge} from "@/components/ui/badge";
import hero from "@/public/illustrations/hero.png"
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import HeroIllustration from "@/components/layout/sections/hero-illustration";

export const HeroSection = () => {
    return (
        <section className="container w-full mx-auto">
            <div className="grid grid-cols-3 h-1/2 items-center max-w-7xl gap-8 mx-auto py-24 md:py-32 mt-16">
                <div className="col-span-1 text-left space-y-8">
                    {/*<Badge variant="outline" className="text-sm py-2">*/}
                    {/*    <span className="mr-2 text-primary">*/}
                    {/*      <Badge>New</Badge>*/}
                    {/*    </span>*/}
                    {/*    <span> Demo is out now! </span>*/}
                    {/*</Badge>*/}

                    <div className="max-w-screen-md mx-auto text-4xl md:text-6xl font-bold">
                        <h1>
                            {`Where patient groups `}
                            <span
                                className="inline-flex text-transparent pr-2 bg-gradient-to-r from-[#E65D27] to-[#EEAE43] bg-clip-text">
                                drive
                            </span>
                            <span
                                className="inline-flex text-transparent px-2 bg-gradient-to-r from-[#5AC1CF] to-[#1E3A8A] bg-clip-text">
                                research
                            </span>
                        </h1>
                    </div>

                    <p className="max-w-screen-sm text-xl text-muted-foreground">
                        {`Design and manage your research roadmap. Connect with academics, CROs, and other patient groups who can help.`}
                    </p>

                    <div className="flex flex-row space-x-2">
                        <Link
                            href="#benefits"
                            className={cn(buttonVariants({variant: "default"}), "w-5/6 md:w-1/2 font-bold group/arrow")}
                        >
                            For patient groups
                        </Link>
                        <Link
                            href="/researchers"
                            className={cn(buttonVariants({variant: "default"}), "w-5/6 md:w-1/2 font-bold group/arrow")}
                        >
                            For researchers
                        </Link>
                    </div>

                </div>
                {/*<div className="relative">*/}
                {/*    <Image*/}
                {/*        priority*/}
                {/*        src={hero}*/}
                {/*        alt="RareSearch hero"*/}
                {/*        className="w-full"*/}
                {/*    />*/}
                {/*</div>*/}
                <HeroIllustration/>
            </div>
        </section>
    );
};
