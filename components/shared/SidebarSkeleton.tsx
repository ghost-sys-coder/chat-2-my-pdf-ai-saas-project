import React from "react";

const SidebarSkeleton = () => {
  return (
    <div className="w-full h-full p-4 bg-gray-900 text-gray-200 relative flex flex-col animate-pulse">
      {/* New Chat Button Skeleton */}
      <div className="w-full h-10 rounded-md bg-gray-800 mb-4" />

      {/* Chat list skeleton */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-2 pb-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center p-2 rounded-md bg-gray-800"
          >
            {/* Icon skeleton */}
            <div className="h-4 w-4 rounded-full bg-gray-700 mr-2" />

            {/* Text skeleton */}
            <div className="h-4 w-full rounded bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="absolute bottom-4 left-4 right-4 border-t border-gray-800 pt-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <div className="h-3 w-10 bg-gray-800 rounded" />
          <div className="h-3 w-12 bg-gray-800 rounded" />
          <div className="h-3 w-14 bg-gray-800 rounded" />
          <div className="h-3 w-20 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
