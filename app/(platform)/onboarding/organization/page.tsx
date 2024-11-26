import OrganizationOnboardingForm from "@/components/organization-onboarding-form";
import {Separator} from "@/components/ui/separator";
import ProfilePage from "@/app/(platform)/app/profile/page";
import PAGProfilePagePreview from "@/components/pag-profile-page-preview";

export default function OrganizationOnboardingPage() {
    return (
        <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-1/2">
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">
                        Organization onboarding
                    </h1>
                    <p>
                        {`Welcome ${"James"}, we have a few questions about your organization to help get your profile started.
                    You can join an organization if it already exists on Comend, or create a new one.
                    `}
                    </p>
                </div>

                <Separator/>
                <OrganizationOnboardingForm/>
            </div>
            <div className="space-y-4 w-1/2">
                <PAGProfilePagePreview/>
            </div>
        </main>
)
}