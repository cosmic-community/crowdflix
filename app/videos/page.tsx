import { cosmic, hasStatus } from '@/lib/cosmic'
import { Video } from '@/types'
import VideoGrid from '@/components/VideoGrid'

export const revalidate = 60

async function getVideos(): Promise<Video[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'videos', 'metadata.status.key': 'published' })
      .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
      .depth(1)
    
    // Sort by view count descending
    return (response.objects as Video[]).sort((a, b) => {
      const viewsA = a.metadata.view_count || 0
      const viewsB = b.metadata.view_count || 0
      return viewsB - viewsA
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

export default async function VideosPage() {
  const videos = await getVideos()
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">All Videos</h1>
        <p className="text-cosmic-gray-300">
          Browse all community-created AI videos sorted by popularity
        </p>
      </div>

      {videos.length > 0 ? (
        <VideoGrid videos={videos} />
      ) : (
        <div className="card text-center py-12">
          <p className="text-cosmic-gray-400 text-lg">
            No videos available yet. Be the first to create one!
          </p>
        </div>
      )}
    </div>
  )
}