"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import projects from "../../../../data/projects.json"
import Image from "next/image";
import React, {forwardRef, ReactElement, ReactNode} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {FaAtom, FaUsers} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";
import {createDicebearAvatar, shuffleArray} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const ProjectsSection = () => {

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
                        <FaAtom className="h-8 w-8"/>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {`Projects`}
                        </h2>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Browse the active projects on RareSearch.
                    </p>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-md border border-none">
                    <div className="flex space-x-4 p-4">
                        {shuffleArray(projects).map((project, index) => (
                            <Link
                                key={project.title}
                                href={`pag/project/${project.title}/overview`}
                            >
                                <MotionCard
                                    whileHover={{
                                        scale: 1.01,
                                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    transition={{type: "spring", stiffness: 300}}
                                    className="w-96 h-64 flex flex-row items-start"
                                >
                                    <div className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-lg text-wrap line-clamp-2"
                                            >
                                                {project.title}
                                            </CardTitle>
                                            <div className="space-y-1 space-x-1 text-wrap">
                                                {project?.tags.map((badge: string, index: number) =>
                                                    <Badge key={index}>
                                                        {badge.charAt(0).toUpperCase() + badge.slice(1)}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="text-muted-foreground text-wrap line-clamp-3">
                                                {project.executiveSummary}
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
