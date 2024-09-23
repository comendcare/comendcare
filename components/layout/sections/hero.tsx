"use client";
import {Badge} from "@/components/ui/badge";
import hero from "@/public/illustrations/hero.png"
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import HeroIllustration from "@/components/layout/sections/hero-illustration";
import {HeroHighlight, Highlight} from "@/components/layout/sections/hero-highlight";
import {motion} from "framer-motion";
import {LinkPreview} from "@/components/link-preview";
import scimanticLogo from "@/public/logos/scimantic-logo.png"
import librareyLogo from "@/public/logos/librarey-logo.svg"
import {Label} from "@/components/ui/label";
import {FancyInput} from "@/components/ui/fancy-input";
import React from "react";
import {LabelInputContainer} from "@/components/contact-form";
import {RainbowSubscribeButton} from "@/components/ui/rainbow-subscribe-button";


export const HeroSection = () => {
    return (
        <section className="container w-full mx-auto">
            <div className="grid grid-cols-5 h-1/2 items-center max-w-7xl gap-8 mx-auto py-24 md:py-24 mt-16">
                <div className="col-span-2 text-left space-y-8">
                    {/*<Badge variant="outline" className="text-sm py-2">*/}
                    {/*    <span className="mr-2 text-primary">*/}
                    {/*      <Badge>New</Badge>*/}
                    {/*    </span>*/}
                    {/*    <span> Demo is out now! </span>*/}
                    {/*</Badge>*/}

                    {/*<div className="mx-auto text-4xl md:text-6xl font-bold">*/}
                    {/*<h1>*/}
                    {/*    {`Where patient groups `}*/}
                    {/*    <span*/}
                    {/*        className="inline-flex text-transparent pr-2 bg-gradient-to-r from-[#E65D27] to-[#EEAE43] bg-clip-text">*/}
                    {/*        drive*/}
                    {/*    </span>*/}
                    {/*    <span*/}
                    {/*        className="inline-flex text-transparent px-2 bg-gradient-to-r from-[#5AC1CF] to-[#1E3A8A] bg-clip-text">*/}
                    {/*        research*/}
                    {/*    </span>*/}
                    {/*</h1>*/}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: [20, -5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                        className="hidden sm:mt-8 sm:flex lg:mt-8"
                    >
                        <div
                            className="inline-flex items-center rounded-full px-3 py-1 text-base leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                            From the creators of
                            <LinkPreview
                                url={"https://www.librarey.com/"}
                                className="hover:underline inline-flex items-center mx-2 gap-x-1"
                                target="_blank"
                            >
                                <Image src={librareyLogo} alt="" className="self-center w-8 h-8"/>
                                Librarey
                            </LinkPreview>
                            and
                            <LinkPreview
                                url={"https://scimantic.com/"}
                                className="hover:underline inline-flex items-center mx-2 gap-x-1"
                                target="_blank"
                            >
                                <Image src={scimanticLogo} alt="" className="self-center w-6 h-6"/>
                                Scimantic
                            </LinkPreview>
                        </div>
                    </motion.div>

                    <HeroHighlight>
                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: [20, -5, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0.0, 0.2, 1],
                            }}
                            className="max-w-screen-md text-2xl md:text-4xl lg:text-6xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug"
                        >
                            Where patient groups
                            <Highlight className="text-black dark:text-white">
                                drive research
                            </Highlight>
                        </motion.h1>
                    </HeroHighlight>
                    {/*</div>*/}

                    <motion.p
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: [20, -5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                        className="max-w-screen-sm text-xl text-muted-foreground"
                    >
                        {`Design your research roadmap. Connect with academics, CROs, and other patient groups who can help.`}
                    </motion.p>

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: [20, -5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                        className="flex flex-row space-x-2"
                    >
                        {/*<Link*/}
                        {/*    href="#benefits"*/}
                        {/*    className={cn(buttonVariants({variant: "default"}), "w-5/6 md:w-1/2 font-bold group/arrow")}*/}
                        {/*>*/}
                        {/*    For patient groups*/}
                        {/*</Link>*/}
                        {/*<Link*/}
                        {/*    href="/researchers"*/}
                        {/*    className={cn(buttonVariants({variant: "default"}), "w-5/6 md:w-1/2 font-bold group/arrow")}*/}
                        {/*>*/}
                        {/*    For researchers*/}
                        {/*</Link>*/}

                        <div className="w-full flex flex-col space-y-2">
                            <Label className="text-base">
                                🎉&nbsp;&nbsp;Become a beta tester
                            </Label>
                            <div className="w-full flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                                <LabelInputContainer>
                                    <FancyInput id="name" placeholder="Name" type="text"/>
                                </LabelInputContainer>
                                <LabelInputContainer>
                                    <FancyInput id="email" placeholder="Email" type="email"/>
                                </LabelInputContainer>
                            </div>
                            <RainbowSubscribeButton
                                subscribeStatus={false}
                                initialText="Join"
                                changeText="Joined"
                                buttonTextColor="white"
                            />
                        </div>
                    </motion.div>

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
