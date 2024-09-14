"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import researchers from "../../../../data/researchers.json"
import Image from "next/image";
import React, {forwardRef, ReactElement, ReactNode} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {FaVial} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";
import {createDicebearAvatar, shuffleArray} from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const ResearchersSection = () => {

    const card = forwardRef<HTMLDivElement, CardProps>(({children, className}, ref) => (
        <Card ref={ref} className={className}>
            {children}
        </Card>
    ))

    const MotionCard = motion(card);

    return (
        <section id="projects" className="container w-full py-8">
            <div className="flex flex-col items-start mx-auto lg:max-w-screen-xl lg:gap-8">
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center space-x-4">
                        <FaVial className="h-8 w-8"/>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {`Researchers`}
                        </h2>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Browse researchers looking for collaborations on RareSearch.
                    </p>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-md border border-none">
                    <div className="flex space-x-4 p-4">
                        {shuffleArray(researchers).map((researcher, index) => (
                            <Link
                                key={researcher.name}
                                href={`researcher/${researcher.name}/profile`}
                            >
                                <MotionCard
                                    whileHover={{
                                        scale: 1.01,
                                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    transition={{type: "spring", stiffness: 300}}
                                    className="w-80 h-56 flex flex-row items-start"
                                >
                                    <div className="flex flex-col">
                                        <CardHeader className="flex flex-row items-center justify-start gap-4">
                                            <img alt="" src={createDicebearAvatar(researcher.name, 50, 40, "personas")}
                                                 className="h-16 w-16 rounded-full"/>
                                            <CardTitle
                                                className="flex flex-col"
                                            >
                                                <div
                                                    className="text-lg text-wrap line-clamp-2"
                                                >
                                                    {researcher.name}
                                                </div>
                                                <div
                                                    className="text-sm text-muted-foreground text-wrap line-clamp-2"
                                                >
                                                    {researcher.association}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="text-muted-foreground text-wrap line-clamp-3">
                                                {researcher.description}
                                            </div>
                                        </CardContent>
                                    </div>
                                </MotionCard>
                            </Link>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal"/>
                </ScrollArea>
            </div>
        </section>
    );
};
