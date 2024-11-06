import { redirect } from 'next/navigation';

export default function OldPage() {
    // Redirect to the target page immediately
    redirect('/onboarding/user');

    // You can return null because this page won't render
    return null;
}