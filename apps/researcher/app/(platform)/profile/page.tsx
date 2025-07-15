import { redirect } from 'next/navigation';
import {getSession} from "~researcher/lib/auth";

export default async function ResearcherProfilePage() {
    const session = await getSession()
    // Redirect to the target page immediately
    redirect(`/profile/${session?.user?.id}`);

    // You can return null because this page won't render
    return null;
}
