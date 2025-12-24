'use client'

import { Video } from '@/types'

interface VideoPlayerProps {
  video: Video
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoUrl = video.metadata?.video_file?.url
  const thumbnail = video.thumbnail
    ? `${video.thumbnail}?w=1200&h=675&fit=crop&auto=format,compress`
    : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&h=675&fit=crop&auto=format'
  
  return (
    <div className="card">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-cosmic-gray-900 mb-4">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            poster={thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <img
              src={thumbnail}
              alt={video.title}
              className="w-full h-full object-cover opacity-50"
              width={600}
              height={337}
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-purple"></div>
              <p className="text-cosmic-gray-400">Video is processing...</p>
            </div>
          </div>
        )}
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
    </div>
  )
}