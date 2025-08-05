import { redirect } from 'next/navigation';

export default function OnboardingPage() {
    // Redirect to the target page immediately
    redirect('/onboarding/welcome');

    // You can return null because this page won't render
    return null;
}
