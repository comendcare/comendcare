"use client"

import {useRouter} from "next/navigation";
import {PulsatingButton} from "@/components/ui/pulsating-button";

export default function CreateOrJoinOrganizationButton() {
    const router = useRouter();

    return (
        <PulsatingButton
            className="bg-black"
            pulseColor={"#9ca3af"}
            onClick={() => router.push("/app/create/new-organization")}
        >
            Create or join an organization
        </PulsatingButton>
    )
}