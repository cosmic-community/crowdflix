import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Video } from '@/types'
import Link from 'next/link'

export const revalidate = 0 // Always fetch fresh data

async function getUserVideos(userEmail: string): Promise<Video[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'videos', 'metadata.created_by': userEmail })
      .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
      .depth(1)
    
    // Sort by creation date descending
    return (response.objects as Video[]).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

export default async function ManageVideosPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const videos = await getUserVideos(user.email)
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Manage Your Videos</h1>
        <p className="text-cosmic-gray-300">
          View and manage your created videos and their extension proposals
        </p>
      </div>

      {videos.length > 0 ? (
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
                href={`/manage/${video.slug}`}
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
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                    {video.metadata?.status?.value || 'Unknown'}
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
                
                <div className="mt-3 pt-3 border-t border-cosmic-gray-800">
                  <span className="text-cosmic-purple text-sm font-semibold">
                    Manage Extensions →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-cosmic-gray-400 text-lg mb-6">
            You haven't created any videos yet.
          </p>
          <Link href="/create" className="btn-primary inline-block">
            Create Your First Video
          </Link>
        </div>
      )}
    </div>
  )
}