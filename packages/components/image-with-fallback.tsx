export default function ImageWithFallback({
                                              src,
                                              alt,
                                              className,
                                              fallback
                                          }: {
    src: string
    alt: string
    className: string
    fallback: string
}) {
    const handleError = (e: any) => {
        e.target.onerror = null
        e.target.src = fallback
    }

    return (
        <img // We use img because Next will complain that I haven't added all the favicon images to the next.config.js
            src={src}
            alt={alt}
            className={className}
            onError={handleError}
        />
    )
}
