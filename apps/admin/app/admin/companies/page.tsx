import { redirect } from 'next/navigation';

export default function AdminUsersPage() {
    // Redirect to the target page immediately
    redirect('/admin/companies/contact-requests');

    // You can return null because this page won't render
    return null;
}
