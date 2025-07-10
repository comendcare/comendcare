import {getSession} from "~researcher/lib/auth";
import {redirect} from "next/navigation";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    const session = await getSession()
    console.log("shit", session)
    if (!session) {
        redirect("/?error=unauthenticated");
    } else if (session.terminate) {
        redirect("/signed-out?reason=terminated");
    } else if (session.roleChanged) {
        redirect("/signed-out?reason=roleChanged");
    }

    return (
        <>
            {children}
        </>
    )
}
