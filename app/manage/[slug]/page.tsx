// app/manage/[slug]/page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Video, ExtensionProposal } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'
import ManageProposalCard from '@/components/ManageProposalCard'
import Link from 'next/link'

export const revalidate = 0 // Always fetch fresh data

async function getVideo(slug: string): Promise<Video | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'videos', slug })
      .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
      .depth(1)
    
    return response.object as Video
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

async function getProposals(videoId: string): Promise<ExtensionProposal[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'extension-proposals', 'metadata.parent_video': videoId })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    // Sort by upvote count descending
    return (response.objects as ExtensionProposal[]).sort((a, b) => {
      const votesA = a.metadata.upvote_count || 0
      const votesB = b.metadata.upvote_count || 0
      return votesB - votesA
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const video = await getVideo(slug)
  
  if (!video) {
    return {
      title: 'Video Not Found - Crowdflix',
    }
  }
  
  return {
    title: `Manage ${video.title} - Crowdflix`,
    description: 'Manage extension proposals for your video',
  }
}

export default async function ManageVideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { slug } = await params
  const video = await getVideo(slug)
  
  if (!video) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Video Not Found</h1>
          <p className="text-cosmic-gray-400 mb-6">
            The video you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/manage" className="btn-primary inline-block">
            Back to Management
          </Link>
        </div>
      </div>
    )
  }
  
  // Check if user owns this video
  if (video.metadata.created_by !== user.email) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-cosmic-gray-400 mb-6">
            You can only manage videos that you created.
          </p>
          <Link href="/manage" className="btn-primary inline-block">
            Back to Management
          </Link>
        </div>
      </div>
    )
  }
  
  const proposals = await getProposals(video.id)
  const pendingProposals = proposals.filter(p => p.metadata.status.key === 'pending')
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/manage" className="text-cosmic-purple hover:text-cosmic-blue transition-colors">
          ← Back to All Videos
        </Link>
      </div>

      {/* Video Player Section */}
      <div className="mb-12">
        <VideoPlayer video={video} />
      </div>

      {/* Video Info */}
      <div className="mb-12">
        <div className="flex items-center gap-4 text-sm text-cosmic-gray-400 mb-4">
          <span>👁️ {video.metadata.view_count || 0} views</span>
          {video.metadata.created_by && (
            <span>👤 {video.metadata.created_by}</span>
          )}
          {video.metadata.duration && (
            <span>⏱️ {video.metadata.duration}s</span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            video.metadata.status.key === 'published' ? 'bg-green-500/20 text-green-400' :
            video.metadata.status.key === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
            video.metadata.status.key === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-cosmic-gray-700 text-cosmic-gray-300'
          }`}>
            {video.metadata.status.value}
          </span>
        </div>
        
        {video.metadata.description && (
          <p className="text-cosmic-gray-300 mb-4">{video.metadata.description}</p>
        )}
        
        <div className="card bg-cosmic-gray-900">
          <h3 className="font-semibold mb-2">Original Prompt:</h3>
          <p className="text-cosmic-gray-400 italic">"{video.metadata.original_prompt}"</p>
        </div>
      </div>

      {/* Extension Proposals Management Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Extension Proposals ({pendingProposals.length})</h2>
        
        {pendingProposals.length > 0 ? (
          <div className="space-y-4">
            <div className="card bg-cosmic-purple/10 border border-cosmic-purple/30">
              <p className="text-cosmic-gray-300">
                <strong>Select a proposal below to extend your video.</strong> The selected proposal will be used to generate a new video continuation. All other pending proposals will be archived.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {pendingProposals.map((proposal) => (
                <ManageProposalCard 
                  key={proposal.id} 
                  proposal={proposal}
                  videoId={video.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-cosmic-gray-400">
              No pending extension proposals for this video.
            </p>
            <Link 
              href={`/videos/${video.slug}`}
              className="btn-primary inline-block mt-4"
            >
              View Public Page
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}