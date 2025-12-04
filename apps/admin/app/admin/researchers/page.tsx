import { redirect } from 'next/navigation';

export default function AdminResearchersPage() {
    // Redirect to the target page immediately
    redirect('/admin/researchers/database');

    // You can return null because this page won't render
    return null;
}
