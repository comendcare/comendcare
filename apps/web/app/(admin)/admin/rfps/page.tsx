import { redirect } from 'next/navigation';

export default function AdminRFPsPage() {
    // Redirect to the target page immediately
    redirect('/admin/rfps/analytics');

    // You can return null because this page won't render
    return null;
}