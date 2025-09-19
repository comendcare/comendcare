"use client"

import {useRouter} from "next/navigation";
import {PulsatingButton} from "@comend/components/ui/pulsating-button";

export default function CreateOrJoinOrganizationButton() {
    const router = useRouter();

    return (
        <PulsatingButton
            className="bg-black"
            pulseColor={"#9ca3af"}
            onClick={() => router.push("/create/new-organization")}
        >
            Create an organization
        </PulsatingButton>
    )
}
