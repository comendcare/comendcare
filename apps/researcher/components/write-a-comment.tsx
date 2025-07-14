"use client"
import React, {useEffect, useState} from "react"
import va from "@vercel/analytics"
import {useSession} from "next-auth/react"
import {toast} from "sonner"
import {usePathname, useRouter} from "next/navigation"

export default function WriteAComment({
    requestId
}: {requestId: string}) {
    const router = useRouter()
    const pathname = usePathname()
    const {data: session, status} = useSession()
    const [comment, setComment] = useState("")
    const [canSubmit, setCanSubmit] = useState(false)

    useEffect(() => {
        setCanSubmit(!!comment)
    }, [comment])


    const handleCreateCommentSubmit = () => {
    };

    return (
        <div className="mb-6">
            <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
                <label htmlFor="comment" className="sr-only">
                    Your comment
                </label>
                <textarea
                    id="comment"
                    rows={6}
                    className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none"
                    placeholder="Write a comment..."
                    required
                    onChange={e => setComment(e.target.value)}
                    value={comment}
                ></textarea>
            </div>
            <button
                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
                onClick={handleCreateCommentSubmit}
                disabled={!canSubmit}
            >
                Post comment
            </button>
        </div>
    )
}
