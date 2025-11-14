import {ReactNode, Suspense} from "react";

export default async function ProfileLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <div className="min-h-screen">
                {children}
            </div>
        </div>
    );
}
