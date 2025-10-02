"use client";

import * as React from "react";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {Skeleton} from "@comend/components/ui/skeleton";
import {useLoadingTimeout} from "~web/hooks/useLoadingTimeout";
import {Separator} from "@/packages/components/ui/separator";

// function TimelineItemSkeleton() {
//     return (
//         <li className="text-left flex items-start -ml-[10px] gap-2">
//             {/* timeline dot */}
//             <div className="flex items-center justify-center rounded-full mt-6">
//                 <Skeleton className="h-4 w-4 rounded-full"/>
//             </div>

//             {/* card */}
//             <div className="bg-card w-full rounded-md relative p-4">
//                 {/* right-side action menu */}
//                 <div className="absolute top-2 right-2">
//                     <Skeleton className="h-8 w-8 rounded-md"/>
//                 </div>

//                 {/* header row: drag handle, title, lock, date */}
//                 <div className="flex flex-row items-start justify-start gap-4 mr-8">
//                     {/* drag handle button area */}
//                     <Skeleton className="h-8 w-8 rounded-md"/>

//                     {/* title + (optional) lock */}
//                     <div className="flex items-center gap-2">
//                         <Skeleton className="h-5 w-64 md:w-80"/>
//                         <Skeleton className="h-5 w-5 rounded-full"/>
//                     </div>

//                     {/* date on the right */}
//                     <div className="ml-auto min-w-fit">
//                         <Skeleton className="h-4 w-32"/>
//                     </div>
//                 </div>

//                 {/* description */}
//                 <div className="mt-2">
//                     <Skeleton className="h-4 w-[85%]"/>
//                 </div>

//                 {/* chips (types / contacts / attachments) */}
//                 <div className="mt-3 flex flex-wrap items-center gap-2">
//                     <Skeleton className="h-6 w-24 rounded-full"/>
//                     <Skeleton className="h-6 w-20 rounded-full"/>
//                     <Skeleton className="h-6 w-28 rounded-full"/>
//                     <Skeleton className="h-6 w-16 rounded-full"/>
//                 </div>

//                 {/* status bar */}
//                 <div className="mt-4">
//                     <Skeleton className="h-[16px] w-40 rounded-md"/>
//                 </div>
//             </div>
//         </li>
//     );
// }

// export function TimelineViewSkeleton({count = 4}: { count?: number }) {
//     useLoadingTimeout(5000);

//     return (
//         <div className="w-full h-full p-2 flex flex-col space-y-2">
//             <>
//                 <div className="w-full flex justify-between items-center">
//                     {/* LEFT: title + stage badge + visibility icon + edit button */}
//                     <div className="h-8 w-56 sm:w-80 md:w-[28rem]">
//                         <Skeleton className="h-8 w-full"/>
//                     </div>
//                     <div className="flex flex-row items-center">
//                         <div className="p-[6px] h-[40px]">
//                             <Skeleton className="h-6 w-28 rounded-full"/>
//                         </div>
//                         <div className="p-[6px] h-[40px] w-[40px] min-w-[40px]">
//                             <Skeleton className="h-full w-full rounded-md"/>
//                         </div>
//                         <div className="min-w-[40px]">
//                             <Skeleton className="h-10 w-10 rounded-md"/>
//                         </div>
//                     </div>

//                 </div>

//                 <Separator className="w-full"/>
//             </>
//             <div className="flex flex-row items-center gap-x-1 justify-start">
//                 <Skeleton className="h-10 w-24"/>
//                 <Skeleton className="h-10 w-20"/>
//             </div>
//             <ol className="ml-12 relative border-s-4 border-blue-light dark:border-gray-700 flex flex-col gap-4">
//                 {Array.from({length: count}).map((_, i) => (
//                     <TimelineItemSkeleton key={i}/>
//                 ))}
//             </ol>
//         </div>
//     );
// }

// export default TimelineViewSkeleton;

export function FlowViewSkeleton() {
  useLoadingTimeout(5000);

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4">
      {/* header row */}
      <div className="w-full flex justify-between items-center">
        <div className="h-8 w-56 sm:w-80 md:w-[28rem]">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      <Separator className="w-full" />

      {/* view toggle */}
      <div className="flex flex-row gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* flow area */}
      <div className="h-full flex flex-row items-center gap-8 mt-8 bg-secondary" />
    </div>
  );
}

export default FlowViewSkeleton