import React, { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { debounce } from 'lodash'

interface InfiniteScrollParamsType {
  lastFetchedPage: number,
  setLastFetchedPage: (page: number) => void
}

export default function InfiniteScroll({ lastFetchedPage, setLastFetchedPage } : InfiniteScrollParamsType) {
  const { ref, inView } = useInView()
  const [isLoading, setIsLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const previousScrollHeight = useRef<number>(0)

  const loadMoreContent = async () => {
    if (isLoading) return
    setIsLoading(true)

    // handle scroll height automatically - all new elements load in below current scroll height in UI
    if (scrollContainerRef.current) {
      previousScrollHeight.current = scrollContainerRef.current.scrollHeight
    }

    setLastFetchedPage(lastFetchedPage + 1)
    setIsLoading(false)
  }

  // debounce so we don't ping the TypeSense DB too often
  const debouncedLoadMoreContent = debounce(() => {
    loadMoreContent();
  }, 500)

  useEffect(() => {
    if (inView) {
      debouncedLoadMoreContent()
    }
  }, [inView])

  useEffect(() => {
    if (scrollContainerRef.current) {
      const newScrollPosition = scrollContainerRef.current.scrollHeight - previousScrollHeight.current
      scrollContainerRef.current.scrollTop += newScrollPosition
    }
  }, [lastFetchedPage])

  return (
    <div
      ref={(node) => {
        scrollContainerRef.current = node
        if (ref) ref(node)
      }}
      className="w-full flex justify-center"
    >
      {isLoading && <LoaderCircle className="h-[40px] w-[40px] animate-spin" />}
    </div>
  )
}