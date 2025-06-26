import * as React from "react";

export const useLike = (postId: string) => {

    const hasLiked = true

    const likeCount = 0

    const toggleLike = React.useCallback(async () => {
    }, []);

    return {
        hasLiked,
        toggleLike,
        likeCount,
    };
};