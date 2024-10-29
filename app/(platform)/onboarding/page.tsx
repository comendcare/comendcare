import OrganizationOnboardingForm from "@/components/organization-onboarding-form"
import Steps, {Step} from "@/components/steps";

const steps: Step[] = [
    { name: 'Create account', description: 'Vitae sed mi luctus laoreet.', href: '#', status: 'complete' },
    {
        name: 'Profile information',
        description: 'Cursus semper viverra facilisis et et some more.',
        href: '#',
        status: 'current',
    },
    { name: 'Business information', description: 'Penatibus eu quis ante.', href: '#', status: 'upcoming' },
    { name: 'Theme', description: 'Faucibus nec enim leo et.', href: '#', status: 'upcoming' },
    { name: 'Preview', description: 'Iusto et officia maiores porro ad non quas.', href: '#', status: 'upcoming' },
]

export default function OnboardingPage() {
    return (
        <main className="flex flex-row items-center space-x-8 w-full max-w-7xl mx-auto">
            <Steps steps={steps}/>
            <OrganizationOnboardingForm/>
        </main>
    )
}
