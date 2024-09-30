export default function WhatElseSection() {
    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"/>
            </div>

            <div className="relative flex justify-center text-center">
                <span className="bg-white px-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground">
                    {`What else we've been up to`}
                </span>
            </div>
        </div>
    )
}
