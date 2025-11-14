import {ReactNode} from "react";

export default async function SettingsLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <div className="min-h-screen">
                {children}
            </div>
        </div>
    );
}
