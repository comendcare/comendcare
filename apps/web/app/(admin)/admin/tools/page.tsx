import { redirect } from 'next/navigation';

export default function AdminToolsPage() {
    // Redirect to the target page immediately
    redirect('/admin/tools/analytics');

    // You can return null because this page won't render
    return null;
}