import WriteAComment from "~researcher/components/write-a-comment"
import Comment from "~researcher/components/comment"
import CommentsEmpty from "~researcher/components/comments-empty"
import {MaterialAndDataAccessRequestWithResearcherAndComments} from "@comend/lib/types";

export default function RequestPageCommentSection({requestData}: {
    requestData: MaterialAndDataAccessRequestWithResearcherAndComments
}) {
    return (
        <section className="bg-white antialiased">
            <div className="w-full mx-auto space-y-8">
                <WriteAComment
                    requestId={requestData.id}
                />
                {
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
                }
            </div>
        </section>
    )
}
