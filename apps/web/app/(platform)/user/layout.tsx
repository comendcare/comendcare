import {ReactNode} from "react";

export default async function UserLayout({children}: { children: ReactNode }) {

    return (
        <div className="flex h-screen w-full">
            {children}
        </div>
    );
}
