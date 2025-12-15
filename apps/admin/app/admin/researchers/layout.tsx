import { ReactNode } from "react";
import { AdminResearchersNav } from "~admin/components/admin-reserachers-nav";

export default async function ResearchersAdminLayout ({children}: { children: ReactNode }) {
    return (
        <div className="pt-4">
        <AdminResearchersNav/>
        {children}
        </div>
    )
}