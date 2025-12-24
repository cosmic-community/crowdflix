// app/api/proposals/[id]/vote/route.ts
import { NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote on proposals' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    // Get current proposal
    const proposalResponse = await cosmic.objects
      .findOne({ type: 'extension-proposals', id })
      .depth(1)
    
    const proposal = proposalResponse.object
    const voterIds = proposal.metadata.voter_ids || []
    
    // Check if user already voted (use user ID from session)
    if (voterIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'You have already voted for this proposal' },
        { status: 400 }
      )
    }
    
    // Update proposal with new vote
    await cosmic.objects.updateOne(id, {
      metadata: {
        upvote_count: (proposal.metadata.upvote_count || 0) + 1,
        voter_ids: [...voterIds, user.id],
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