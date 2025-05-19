"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {Users} from "lucide-react"
import prisma from "@/lib/prisma"
import {useEffect, useState} from "react";
import {getAllOrganizationsWithConditions} from "@/lib/fetchers";
import {toast} from "sonner";
import {Organization} from "@prisma/client";
import {OrganizationsWithConditions} from "@/lib/types";

export async function PharmaProjectRecentRecommendations() {
    const [organizations, setOrganizations] = useState<OrganizationsWithConditions[]>([]);

    useEffect(() => {
        async function fetchOrgData() {
            try {
                const response = await getAllOrganizationsWithConditions()

                // Map the response to the correct structure if needed
                if (response.success && response.data) {
                    setOrganizations(response?.data as any);
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

            } catch (error) {
                console.error("Error fetching organizations:", error);
                toast.error("Couldn't get organizations");
            }
        }

        fetchOrgData()
    }, []);

    return (
        <div className="space-y-8">
            {organizations.slice(0, 5).map((organization) => {
                const patients =
                    organization.condition?.[0]?.condition?.globalEstimatedPopulation ?? "N/A"

                return (
                    <div key={organization.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={organization.image || "/avatars/01.png"} alt={organization.name ?? ""}/>
                            <AvatarFallback>
                                {organization.name ? organization.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase() : ""}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{organization.name}</p>
                            <p className="text-sm text-muted-foreground">{organization.contactEmail}</p>
                        </div>
                        <div className="ml-auto font-medium inline-flex flex-row items-center gap-2">
                            {typeof patients === "number" ? patients.toLocaleString() : patients}
                            <Users className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
