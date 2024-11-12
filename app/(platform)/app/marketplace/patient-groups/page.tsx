import React from "react"
import {Input} from "@/components/ui/input";

export default function PatientGroupsPage({
    params
}: {
    params: { projectId: string }
}) {
    return (
        <main className="max-w-7xl flex flex-col w-full p-4 items-center h-full mx-auto">
            <Input />
        </main>
    )
}
