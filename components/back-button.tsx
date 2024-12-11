"use client"

import { FaArrowLeft } from "react-icons/fa6";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter()

    return (
        <Button
            className="absolute m-4"
            onClick={() => {
                router.back()
            }}
        >
            <FaArrowLeft />
            {`Back`}
        </Button>
    )
}