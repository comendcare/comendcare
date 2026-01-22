"use client";

import Link from "next/link";
import { PulsatingButton } from "@comend/components/ui/pulsating-button";

export default function CreateOrJoinOrganizationButton() {
    return (
        <Link
            href="/create/new-organization"
            prefetch={true}
            className="inline-block"
        >
            <PulsatingButton className="bg-black" pulseColor={"#9ca3af"}>
                Create an organization
            </PulsatingButton>
        </Link>
    );
}
