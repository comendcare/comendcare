"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { mixpanelTrack } from "@comend/lib/mixpanel";

type MixpanelProps = {
    event: string;
    props?: Record<string, unknown>;
};

type TrackingLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> &
    LinkProps & {
    /** If omitted, no tracking happens (so you can progressively adopt this component). */
    track?: MixpanelProps;

    /**
     * Default: true
     * If true, we skip tracking for ctrl/cmd/shift/alt clicks or middle-click
     * (because those often open new tabs and can cause double-counting).
     */
    trackOnlyPlainLeftClick?: boolean;

    /** Default: false */
    disabled?: boolean;

    /** Still allows consumers to add their own click logic. */
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function isPlainLeftClick(e: React.MouseEvent<HTMLAnchorElement>) {
    return (
        e.button === 0 &&
        !e.defaultPrevented &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
    );
}

export function TrackingLink({
                                 track,
                                 trackOnlyPlainLeftClick = true,
                                 disabled = false,
                                 onClick,
                                 children,
                                 ...props
                             }: TrackingLinkProps) {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Run consumer handler first so they can preventDefault() if they want.
        onClick?.(e);

        if (!track) return;
        if (e.defaultPrevented) return;

        if (trackOnlyPlainLeftClick && !isPlainLeftClick(e)) return;

        // Fire and forget; do not await (waiting can delay navigation)
        mixpanelTrack(track.event, track.props ?? {});
    };

    return (
        <Link {...props} onClick={handleClick} aria-disabled={disabled}>
            {children}
        </Link>
    );
}