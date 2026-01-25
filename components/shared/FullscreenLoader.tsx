import { Loader2 } from 'lucide-react';
import React from 'react'

interface FullscreenLoaderProps {
    isLoading: boolean;
    message?: string;
}

const FullscreenLoader: React.FC<FullscreenLoaderProps> = ({ isLoading, message = "Processing..." }) => {
    if (!isLoading) return;

  return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm transition-opacity duration-300'>
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white/95 px-10 py-8 shadow-2xl">
              <Loader2 className='h-12 w-12 animate-spin text-violet-600' />
              <p className="text-lg font-medium text-gray-800">{message}</p>
          </div>
    </div>
  )
}

export default FullscreenLoader