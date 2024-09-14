"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import pags from "../../../../data/pags.json"
import Image from "next/image";
import React, {forwardRef, ReactElement, ReactNode} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {faker} from "@faker-js/faker";
import {FaUsers} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";
import {createDicebearAvatar, shuffleArray} from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const PAGSection = () => {
    faker.seed(123)

    const card = forwardRef<HTMLDivElement, CardProps>(({children, className}, ref) => (
        <Card ref={ref} className={className}>
            {children}
        </Card>
    ))

    const MotionCard = motion(card);


    return (
        <section id="pags" className="container w-full py-8">
            <div className="flex flex-col items-start mx-auto lg:max-w-screen-xl lg:gap-8">
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center space-x-4">
                        <FaUsers className="h-8 w-8"/>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {`Patient groups`}
                        </h2>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Browse the patient groups already on RareSearch.
                    </p>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-md border border-none">
                    <div className="flex space-x-4 p-4">
                        {shuffleArray(pags).map((pag, index) => (
                            <Link
                                key={index}
                                href={`/pag/profile/${pag.groupName}`}
                            >
                                <MotionCard
                                    whileHover={{
                                        scale: 1.01,
                                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    transition={{type: "spring", stiffness: 300}}
                                    className="w-80 flex flex-row items-start"
                                >
                                    <div className="flex flex-col">
                                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                                            <CardTitle
                                                className="text-lg text-wrap line-clamp-2"
                                            >
                                                {pag.groupName}
                                            </CardTitle>
                                            <img alt="" src={createDicebearAvatar(pag.groupName, 50, 40, "identicon")}
                                                 className="h-16 w-16 rounded-full"/>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="text-muted-foreground text-wrap line-clamp-3">
                                            {pag.description}
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
