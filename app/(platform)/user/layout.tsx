import {ReactNode} from "react";
import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";

export default async function UserLayout({children}: { children: ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen w-full">
            {children}
        </div>
    );
}
