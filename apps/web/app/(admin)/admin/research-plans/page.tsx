import { redirect } from 'next/navigation';

export default function AdminResearchPlansPage() {
    // Redirect to the target page immediately
    redirect('/admin/research-plans/analytics');

    // You can return null because this page won't render
    return null;
}
