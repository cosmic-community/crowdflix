// app/api/proposals/[id]/select/route.ts
import { NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { getCurrentUser } from '@/lib/auth'
import { ExtensionProposal, Video } from '@/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to select proposals' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const { videoId } = await request.json()
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }
    
    // Get the proposal
    const proposalResponse = await cosmic.objects
      .findOne({ type: 'extension-proposals', id })
      .depth(1)
    
    const proposal = proposalResponse.object as ExtensionProposal
    
    // Get the parent video to verify ownership
    const videoResponse = await cosmic.objects
      .findOne({ type: 'videos', id: videoId })
      .depth(1)
    
    const video = videoResponse.object as Video
    
    // Verify the user owns this video
    if (video.metadata.created_by !== user.email) {
      return NextResponse.json(
        { error: 'You can only select proposals for videos you created' },
        { status: 403 }
      )
    }
    
    // Verify the proposal belongs to this video
    if (proposal.metadata.parent_video.id !== videoId) {
      return NextResponse.json(
        { error: 'This proposal does not belong to the specified video' },
        { status: 400 }
      )
    }
    
    // Verify the video has a video file to extend
    if (!video.metadata.video_file) {
      return NextResponse.json(
        { error: 'Video does not have a file to extend' },
        { status: 400 }
      )
    }
    
    console.log('[SELECT PROPOSAL] Starting video extension generation:', {
      proposalId: id,
      videoId,
      prompt: proposal.metadata.proposed_prompt,
      existingVideoUrl: video.metadata.video_file.url
    })
    
    // Step 1: Get the media ID from the video file
    // Extract the media name from the URL
    const videoUrl = video.metadata.video_file.url
    const mediaName = videoUrl.split('/').pop() || ''
    
    console.log('[SELECT PROPOSAL] Extracted media name:', mediaName)
    
    // Query the media library to get the media ID
    const mediaResponse = await cosmic.media.findOne({
      name: mediaName
    })
    
    if (!mediaResponse.media) {
      console.error('[SELECT PROPOSAL] Media not found in library:', mediaName)
      return NextResponse.json(
        { error: 'Video media not found in library' },
        { status: 404 }
      )
    }
    
    const mediaId = mediaResponse.media.id
    console.log('[SELECT PROPOSAL] Found media ID:', mediaId)
    
    // Step 2: Extend the video using Cosmic AI extendVideo method
    console.log('[SELECT PROPOSAL] Extending video with AI...')
    const startTime = Date.now()
    
    // Type-safe model - ensure it's one of the allowed values
    const veoModel = video.metadata.veo_model_used
    const model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview' = 
      veoModel === 'veo-3.1-generate-preview' 
        ? 'veo-3.1-generate-preview' 
        : 'veo-3.1-fast-generate-preview'
    
    console.log('[SELECT PROPOSAL] Calling extendVideo with:', {
      mediaId,
      prompt: proposal.metadata.proposed_prompt,
      model
    })
    
    // Extend the video using the media ID
    // Note: extendVideo does NOT accept duration parameter - it inherits from source video
    const videoExtensionResult = await cosmic.ai.extendVideo({
      media_id: mediaId,
      prompt: proposal.metadata.proposed_prompt,
      model
    })
    
    const generationTime = Math.floor((Date.now() - startTime) / 1000)
    console.log('[SELECT PROPOSAL] Video extended successfully:', {
      generationTime,
      videoUrl: videoExtensionResult.media?.url
    })
    
    // Step 3: Update the video object with the new extended video file
    console.log('[SELECT PROPOSAL] Updating video object with extended video file...')
    await cosmic.objects.updateOne(videoId, {
      metadata: {
        video_file: videoExtensionResult.media.name,
        original_prompt: proposal.metadata.proposed_prompt,
        parent_video: videoId,
        generation_time: generationTime,
      }
    })
    
    // Step 4: Mark this proposal as selected
    console.log('[SELECT PROPOSAL] Marking proposal as selected...')
    await cosmic.objects.updateOne(id, {
      metadata: {
        status: 'selected',
      }
    })
    
    // Step 5: Archive all other pending proposals for this video
    console.log('[SELECT PROPOSAL] Archiving other pending proposals...')
    const allProposalsResponse = await cosmic.objects
      .find({ 
        type: 'extension-proposals', 
        'metadata.parent_video': videoId,
        'metadata.status': 'pending'
      })
      .props(['id'])
    
    const otherProposals = allProposalsResponse.objects.filter((p: any) => p.id !== id)
    
    // Archive each pending proposal (except the selected one)
    for (const otherProposal of otherProposals) {
      await cosmic.objects.updateOne(otherProposal.id, {
        metadata: {
          status: 'archived',
        }
      })
    }
    
    console.log('[SELECT PROPOSAL] Successfully archived', otherProposals.length, 'other proposals')
    
    return NextResponse.json({
      message: 'Video extended successfully! Your video has been updated with the new extension.',
      videoUrl: videoExtensionResult.media.url,
      generationTime,
      archivedProposals: otherProposals.length,
    })
  } catch (error: any) {
    console.error('[SELECT PROPOSAL] Error:', error)
    
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'Proposal or video not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to extend video',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}