import { ReactNode, Suspense } from "react"
import Profile from "@/components/profile"
import AdminNav from "@/components/admin-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <AdminNav>
                <Suspense fallback={<div>Loading...</div>}>
                    <Profile />
                </Suspense>
            </AdminNav>
            <div className="min-h-screen dark:bg-black sm:pl-60">
                {children}
            </div>
        </div>
    )
}
