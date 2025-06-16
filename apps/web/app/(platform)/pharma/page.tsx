import { redirect } from 'next/navigation';

export default function SignInPage() {
    // Redirect to the target page immediately
    redirect('/pharma/dashboard');

    // You can return null because this page won't render
    return null;
}
