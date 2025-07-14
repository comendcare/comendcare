import WriteAComment from "~researcher/components/write-a-comment"
import Comment from "~researcher/components/comment"
import CommentsEmpty from "~researcher/components/comments-empty"
import {MaterialAndDataAccessRequestWithComents} from "@comend/lib/types";

export default function RequestPageCommentSection({requestData}: {requestData: MaterialAndDataAccessRequestWithComents}) {
    return (
        <section className="bg-white py-8 lg:py-16 antialiased">
            <div className="w-full mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-bold">
                        {/* Count the total number of comments plus replies of each comment */}
                        Discussion (
                        {requestData &&
                            requestData.comments.length +
                            requestData.comments.reduce(
                                (acc: number, comment: any) =>
                                    acc + comment._count.replies,
                                0
                            )}
                        )
                    </h2>
                </div>
                <WriteAComment
                    requestId={requestData.id}
                />
                {requestData &&
                requestData.comments &&
                requestData.comments.length > 0 ? (
                    requestData.comments.map(
                        (commentData: any, commentIndex: number) => (
                            <div key={commentIndex}>
                                <Comment
                                    requestId={requestData.id}
                                    commentData={commentData}
                                />
                            </div>
                        )
                    )
                ) : (
                    <CommentsEmpty/>
                )}
            </div>
        </section>
    )
}
