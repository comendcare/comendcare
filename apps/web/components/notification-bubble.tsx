export function NotificationBubble() {
    return (
        <div className="ml-auto flex items-center gap-1 text-sm">
            <span className="animate-ping absolute top-0 right-0 -mt-1 -mr-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-dark opacity-75"></span>
            </span>
        </div>
    )
}