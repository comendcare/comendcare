"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@comend/components/ui/avatar"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@comend/components/ui/hover-card"
import { ReactNode } from "react"

export interface HoverableAvatarProps {
    /** Image URL for the avatar */
    src?: string
    /** Alt text or username handle */
    alt?: string
    /** Fallback initials if image not found */
    fallback?: string
    /** Display name to show in hover card */
    name?: string
    /** Optional description (role, org, etc.) */
    description?: string
    /** Optional children for custom hover content */
    children?: ReactNode
}

export const HoverableAvatar = ({
                                    src,
                                    alt,
                                    fallback,
                                    name,
                                    description,
                                    children,
                                }: HoverableAvatarProps) => {
    return (
        <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
                <Avatar className="cursor-pointer transition hover:grayscale-0">
                    <AvatarImage src={src} alt={alt} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
                {children ? (
                    children
                ) : (
                    <div className="space-y-2">
                        <div className="font-semibold text-sm">{name || alt}</div>
                        {description && (
                            <div className="text-xs text-muted-foreground">{description}</div>
                        )}
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    )
}
