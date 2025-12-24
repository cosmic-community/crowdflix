import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { CreateProposalFormData } from '@/types'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to create extension proposals' },
        { status: 401 }
      )
    }
    
    const data: CreateProposalFormData = await request.json()
    
    // Validate required fields
    if (!data.parentVideoId || !data.proposedPrompt) {
      return NextResponse.json(
        { error: 'Parent video ID and proposed prompt are required' },
        { status: 400 }
      )
    }
    
    // Create extension proposal with authenticated user info
    const proposalResponse = await cosmic.objects.insertOne({
      type: 'extension-proposals',
      title: `Extension: ${data.proposedPrompt.substring(0, 50)}...`,
      metadata: {
        parent_video: data.parentVideoId,
        proposed_prompt: data.proposedPrompt,
        proposed_by: user.email,
        upvote_count: 0,
        status: 'pending',
        voter_ids: [],
        notes: data.notes || '',
      }
    })
    
    return NextResponse.json({
      proposalId: proposalResponse.object.id,
      message: 'Extension proposal submitted successfully!',
    })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}