"use client"
import React, { useState } from "react"
import CommentReplyDropdown from "~researcher/components/comment-reply-dropdown"
import {formatDate} from "@/packages/lib/format";

export default function Comment(props: {
    requestId: string
    commentData: any
}) {
    const [showWriteReply, setShowWriteReply] = useState(false)

    const handleOnReplyClick = () => {
        setShowWriteReply(!showWriteReply)
    }

    return (
        <article className="p-6 text-base bg-white rounded-lg">
            <footer className="flex justify-between items-center mb-2">
                <div className="relative flex items-center">
                    <img
                        className="rounded-full mr-2"
                        // src={session?.user?.image || defaultAvatar}
                        src={props.commentData.author.image}
                        alt="Your profile picture"
                    />
                    <p className="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold">
                        {props.commentData.author.name}
                    </p>
                    <p className="text-sm text-gray-600 ">
                        <time title={formatDate(props.commentData.createdAt)}>
                            {formatDate(props.commentData.createdAt)}
                        </time>
                    </p>
                </div>
                <CommentReplyDropdown
                    resourceId={props.requestId}
                    id={props.commentData.id}
                />
            </footer>
            <p className="text-gray-500">{props.commentData.body}</p>
        </article>
    )
}
