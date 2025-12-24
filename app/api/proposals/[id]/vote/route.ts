// app/api/proposals/[id]/vote/route.ts
import { NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Get current proposal
    const proposalResponse = await cosmic.objects
      .findOne({ type: 'extension-proposals', id })
      .depth(1)
    
    const proposal = proposalResponse.object
    const voterIds = proposal.metadata.voter_ids || []
    
    // Check if user already voted
    if (voterIds.includes(userId)) {
      return NextResponse.json(
        { error: 'You have already voted for this proposal' },
        { status: 400 }
      )
    }
    
    // Update proposal with new vote
    await cosmic.objects.updateOne(id, {
      metadata: {
        upvote_count: (proposal.metadata.upvote_count || 0) + 1,
        voter_ids: [...voterIds, userId],
      }
    })
    
    return NextResponse.json({
      message: 'Vote recorded successfully',
      upvote_count: (proposal.metadata.upvote_count || 0) + 1,
    })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }
    console.error('Error voting on proposal:', error)
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}