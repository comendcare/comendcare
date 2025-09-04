"use client"
import React, { useState } from "react"
import {formatDate} from "./../../../../packages/lib/format";
import CommentReplyDropdown from "./comment-reply-dropdown";
import {ProfilePhoto} from "../../profile-photo";

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
                    <ProfilePhoto
                        img={props.commentData.author.image}
                        name={props.commentData.author.name}
                        className="size-8 mr-2 rounded-full"
                    />
                    <p className="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold">
                        {props.commentData.author.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        <time title={formatDate(props.commentData.createdAt)}>
                            {formatDate(props.commentData.createdAt)}
                        </time>
                    </p>
                </div>
                <CommentReplyDropdown
                    requestId={props.requestId}
                    id={props.commentData.id}
                />
            </footer>
            <p className="text-gray-500">{props.commentData.text}</p>
        </article>
    )
}
