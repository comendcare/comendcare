"use client"

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {createFollow} from "@/lib/actions";
import {toast} from "sonner";
import {isUserFollowing} from "@/lib/fetchers";
import { Check, Plus } from "lucide-react";

export default function PAGFollowButton({organizationId}: { organizationId: string }) {
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null); // Use state to track following status
    const [loading, setLoading] = useState(false); // Track loading state for actions

    async function checkIfFollowing() {
        setLoading(true); // Show loading while fetching data
        try {
            const response = await isUserFollowing(organizationId);

            if (response.success) {
                // Ensure response.data is a boolean or null
                setIsFollowing(response.data ?? null);
            } else {
                console.error(response.error || "Unexpected response structure");
                toast.error("Failed to check if you're already following this organization.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while checking your following status.");
        } finally {
            setLoading(false); // Hide loading after fetching
        }
    }

    // Function to follow the organization
    async function followPAG() {
        setLoading(true); // Show loading while processing follow
        try {
            const response = await createFollow(organizationId);
            if (response.success) {
                toast.success("Follow created successfully!");
                setIsFollowing(true); // Update following status
            } else {
                console.error(response.error);
                toast.error(response.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to follow organization.");
        } finally {
            setLoading(false); // Hide loading after processing
        }
    }

    // Check if the user is following when the component mounts
    useEffect(() => {
        checkIfFollowing();
    }, [organizationId]);

    return (
        <Button
            className="gap-x-2"
            onClick={isFollowing ? undefined : followPAG} // Prevent clicking if already following
            disabled={loading} // Keep button enabled while loading or if status is unknown
            variant={isFollowing ? "outline" : "default"}
        >
            {loading ? (
                <>Loading...</>
            ) : isFollowing ? (
                <>
                    <Check />
                    Following
                </>
            ) : (
                <>
                    <Plus />
                    Follow
                </>
            )}
        </Button>
    );
}
