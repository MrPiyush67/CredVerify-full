import { Loader2 } from 'lucide-react';

/**
 * CodeEditorSkeleton - Loading skeleton component
 * Shows a loading animation with an optional caption
 */
export default function CodeEditorSkeleton({ caption = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      {/* Animated loader */}
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      
      {/* Caption */}
      {caption && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {caption}
        </p>
      )}
      
      {/* Optional skeleton lines */}
      <div className="space-y-3 w-full max-w-md mt-6">
        <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-2 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
    </div>
  );
}
