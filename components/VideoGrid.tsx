import Link from 'next/link'
import { Video } from '@/types'

interface VideoGridProps {
  videos: Video[]
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-cosmic-gray-400">No videos available</p>
      </div>
    )
  }
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        if (!video || !video.id) {
          return null
        }
        
        const thumbnail = video.thumbnail 
          ? `${video.thumbnail}?w=800&h=450&fit=crop&auto=format,compress`
          : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=450&fit=crop&auto=format'
        
        return (
          <Link 
            key={video.id} 
            href={`/videos/${video.slug}`}
            className="card group cursor-pointer"
          >
            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-cosmic-gray-900">
              <img
                src={thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={400}
                height={225}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-6xl">▶️</div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-cosmic-purple transition-colors">
              {video.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-cosmic-gray-400">
              <span>👁️ {video.metadata?.view_count || 0} views</span>
              {video.metadata?.duration && (
                <span>⏱️ {video.metadata.duration}s</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}