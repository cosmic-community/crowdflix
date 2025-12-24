import Link from 'next/link'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Video } from '@/types'
import VideoGrid from '@/components/VideoGrid'

export const revalidate = 60

async function getVideos(): Promise<Video[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'videos', 'metadata.status': 'Published' })
      .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
      .depth(1)
    
    return response.objects as Video[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

export default async function HomePage() {
  const videos = await getVideos()
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cosmic-purple to-cosmic-blue bg-clip-text text-transparent">
          Welcome to Crowdflix
        </h1>
        <p className="text-xl text-cosmic-gray-300 mb-8 max-w-3xl mx-auto">
          Create and extend AI-generated videos collaboratively. Submit your prompts, vote on extensions, and watch stories evolve through community creativity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create" className="btn-primary">
            🎬 Create New Video
          </Link>
          <Link href="/videos" className="btn-secondary">
            📹 Browse All Videos
          </Link>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Videos</h2>
          <Link href="/videos" className="text-cosmic-purple hover:text-cosmic-blue transition-colors">
            View All →
          </Link>
        </div>
        {videos.length > 0 ? (
          <VideoGrid videos={videos.slice(0, 6)} />
        ) : (
          <div className="card text-center py-12">
            <p className="text-cosmic-gray-400 text-lg">
              No videos yet. Be the first to create one!
            </p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-xl font-semibold mb-3">1. Create</h3>
          <p className="text-cosmic-gray-400">
            Submit a prompt and let Cosmic AI generate a unique 4-8 second video using Google's Veo 3.1 models
          </p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-4">🗳️</div>
          <h3 className="text-xl font-semibold mb-3">2. Propose</h3>
          <p className="text-cosmic-gray-400">
            See a video you love? Submit an extension proposal to continue the story
          </p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-3">3. Vote</h3>
          <p className="text-cosmic-gray-400">
            Upvote your favorite proposals. Top-voted extensions get generated and become part of the story
          </p>
        </div>
      </section>
    </div>
  )
}