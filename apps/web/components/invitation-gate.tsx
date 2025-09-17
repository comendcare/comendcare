// packages/components/invitations/invitation-gate.tsx
// Server wrapper that decides whether to block.
// Renders a Client component that shows the modal (non-dismissable) and disables the app behind it.

import InvitationBlocker from "./invitation-blocker";
import React from "react";
import {Organization} from "@prisma/client";

export default function InvitationGate({
                                           invitations,
                                           children,
                                       }: {
    invitations: { id: string; organizationId: string, role: string, organization: Organization }[];
    children: React.ReactNode;
}) {
    if (!invitations || invitations.length === 0) {
        return <>{children}</>;
    }

    // Render the blocker that:
    // - Forces the AlertDialog open
    // - Disables interaction with the app
    // - Uses your existing server actions to accept/decline
    return (
        <InvitationBlocker invitations={invitations}>
            {children}
        </InvitationBlocker>
    );
}
