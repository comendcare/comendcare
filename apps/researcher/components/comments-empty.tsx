export default function CommentsEmpty() {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow md:flex-row w-full">
            <div className="flex flex-col justify-between items-center p-16">
                <h1 className="flex text-center text-lg font-bold leading-none tracking-tight text-gray-900 md:text-xl lg:text-2xl">
                    {`No comments`}
                </h1>
                <p className="flex mt-4 text-center text-sm font-normal text-gray-500 lg:text-base">
                    {`Be the first to leave a comment above`}
                </p>
            </div>
        </div>
    )
}
