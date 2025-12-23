// packages/components/invitations/invitation-gate.tsx
// Server wrapper that decides whether to block.
// Renders a Client component that shows the modal (non-dismissable) and disables the app behind it.

import React from "react";
import type {Organization} from "@prisma/client";
import ClaimInvitationBlocker from "./claim-invitation-blocker";

export default function ClaimOrganizationInvitationGate({
                                           claimInvitations,
                                           children,
                                       }: {
    claimInvitations: { id: string; organizationId: string, role: string, organization: Organization }[];
    children: React.ReactNode;
}) {
    if (!claimInvitations || claimInvitations.length === 0) {
        return <>{children}</>;
    }

    // Render the blocker that:
    // - Forces the AlertDialog open
    // - Disables interaction with the app
    // - Uses your existing server actions to accept/decline
    return (
        <ClaimInvitationBlocker invitations={claimInvitations}>
            {children}
        </ClaimInvitationBlocker>
    );
}
