"use client"

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter()

    return (
        <Button
            className="absolute m-4 top-0 left-0"
            onClick={() => {
                router.back()
            }}
        >
            <ArrowLeft />
            {`Back`}
        </Button>
    )
}