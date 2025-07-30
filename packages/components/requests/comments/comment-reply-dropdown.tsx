"use client"
import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@comend/components/ui/dropdown-menu"
import {Ellipsis, CircleX} from "lucide-react";
import { useSession } from "next-auth/react"
import AreYouSure from "@comend/components/are-you-sure"
import {toast} from "sonner"
import { deleteComment } from "@comend/lib/actions"

export default function CommentReplyDropdown(props: {
    requestId: string
    id: string
}) {
    const { data: session } = useSession()
    const [isAreYouSureOpen, setIsAreYouSureOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const deleteCommentReply = async () => {
        setLoading(true)
        const response = await deleteComment(props.id);
        setLoading(false)

        if (response.success) {
            toast.success("Comment deleted!")
        } else {
            console.error(response.error)
            toast.error("Something went wrong and we couldn't delete your comment... Please try again later.")
        }
    }

    return (
        <DropdownMenu>
            <AreYouSure
                isOpen={isAreYouSureOpen}
                setIsOpen={setIsAreYouSureOpen}
                callback={deleteCommentReply}
                title={"Are you sure?"}
                message={`This comment will be permanently removed. This cannot be undone.`}
            />
            <DropdownMenuTrigger>
                <Ellipsis className="h-5 w-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {/*{data?.user.comments*/}
                {/*    .concat(data?.user.replies)*/}
                {/*    .map((obj: any) => obj.id)*/}
                {/*    .includes(props.id) && (*/}
                {true && (
                    <DropdownMenuItem
                        className="flex flex-row items-center gap-x-2"
                        onClick={() => setIsAreYouSureOpen(!isAreYouSureOpen)}
                    >
                        <CircleX aria-hidden="true" />
                        Delete comment
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
