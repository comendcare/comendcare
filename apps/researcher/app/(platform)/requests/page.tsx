import { redirect } from "next/navigation";

export default function ResearcherAccessRequestsPage() {
    // Redirect to the target page immediately
    redirect('/profile');

    // You can return null because this page won't render
    return null;
}
