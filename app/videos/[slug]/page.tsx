// app/videos/[slug]/page.tsx
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Video, ExtensionProposal } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'
import ProposalCard from '@/components/ProposalCard'
import ExtensionForm from '@/components/ExtensionForm'
import RevisionHistory from '@/components/RevisionHistory'
import Link from 'next/link'

export const revalidate = 60

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

async function getRevisionChain(video: Video): Promise<Video[]> {
  const revisions: Video[] = [video]
  let currentVideo = video
  
  // Traverse backwards through the parent_video chain
  while (currentVideo.metadata.parent_video) {
    try {
      // If parent_video is already a full object (from depth query), use it
      if (typeof currentVideo.metadata.parent_video === 'object' && 
          'id' in currentVideo.metadata.parent_video) {
        const parentVideo = currentVideo.metadata.parent_video as Video
        revisions.push(parentVideo)
        currentVideo = parentVideo
      } else {
        // If it's just an ID, fetch the full object
        const parentId = typeof currentVideo.metadata.parent_video === 'string' 
          ? currentVideo.metadata.parent_video 
          : currentVideo.metadata.parent_video.id
        
        const parentResponse = await cosmic.objects
          .findOne({ type: 'videos', id: parentId })
          .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
          .depth(1)
        
        const parentVideo = parentResponse.object as Video
        revisions.push(parentVideo)
        currentVideo = parentVideo
      }
    } catch (error) {
      // If we can't fetch a parent, stop the chain
      console.error('Error fetching parent video:', error)
      break
    }
  }
  
  return revisions
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
    title: `${video.title} - Crowdflix`,
    description: video.metadata.description || video.metadata.original_prompt,
  }
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
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
          <Link href="/videos" className="btn-primary inline-block">
            Browse All Videos
          </Link>
        </div>
      </div>
    )
  }
  
  const proposals = await getProposals(video.id)
  const pendingProposals = proposals.filter(p => p.metadata.status.key === 'pending')
  const revisionChain = await getRevisionChain(video)
  
  return (
    <div className="container mx-auto px-4 py-12">
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
          {revisionChain.length > 1 && (
            <span>🎬 Revision {revisionChain.length}</span>
          )}
        </div>
        
        {video.metadata.description && (
          <p className="text-cosmic-gray-300 mb-4">{video.metadata.description}</p>
        )}
        
        <div className="card bg-cosmic-gray-900">
          <h3 className="font-semibold mb-2">Current Prompt:</h3>
          <p className="text-cosmic-gray-400 italic">"{video.metadata.original_prompt}"</p>
        </div>
      </div>

      {/* Revision History Section */}
      {revisionChain.length > 1 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🎬 Video Evolution</h2>
          <p className="text-cosmic-gray-400 mb-6">
            Watch how this story has evolved through {revisionChain.length} community-driven extensions
          </p>
          <RevisionHistory revisions={revisionChain} />
        </div>
      )}

      {/* Extension Proposals Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Community Extension Proposals</h2>
        
        {pendingProposals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pendingProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8 mb-8">
            <p className="text-cosmic-gray-400">
              No extension proposals yet. Be the first to suggest how this story continues!
            </p>
          </div>
        )}
      </div>

      {/* Submit Proposal Form */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Propose an Extension</h2>
        <ExtensionForm videoId={video.id} />
      </div>
    </div>
  )
}