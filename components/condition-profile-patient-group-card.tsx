"use client";

import React, { forwardRef, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faker } from "@faker-js/faker";
import { motion } from "framer-motion";
import { createDicebearAvatar } from "@/lib/utils";
import {Organization} from "@prisma/client";

interface CardProps {
    children: ReactNode;
    className?: string;
}

interface PatientGroup {
    groupName: string;
    description: string;
}

export default function ConditionProfilePatientGroupCard({organization}: {organization: Organization}) {
    faker.seed(123);

    // Mock data for demonstration
    const pag: PatientGroup = {
        groupName: faker.company.name(),
        description: faker.lorem.paragraph(),
    };

    // Define the Card component with `forwardRef`
    const CardWithRef = forwardRef<HTMLDivElement, CardProps>(({ children, className }, ref) => (
        <Card ref={ref} className={className}>
            {children}
        </Card>
    ));

    // Add displayName to the forwarded component
    CardWithRef.displayName = "CardWithRef";

    // Create a motion-enhanced Card component
    const MotionCard = motion(CardWithRef);

    return (
        <MotionCard
            whileHover={{
                scale: 1.01,
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full flex flex-row items-start"
        >
            <div className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle className="text-lg text-wrap line-clamp-2">
                        {organization?.name}
                    </CardTitle>
                    <img
                        alt=""
                        src={createDicebearAvatar(pag.groupName, 50, 40, "identicon")}
                        className="h-16 w-16 rounded-full"
                    />
                </CardHeader>

                <CardContent>
                    <div className="text-muted-foreground text-wrap line-clamp-3">
                        {organization.description}
                    </div>
                </CardContent>
            </div>
        </MotionCard>
    );
}
