import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { CreateProposalFormData } from '@/types'

export async function POST(request: Request) {
  try {
    const data: CreateProposalFormData = await request.json()
    
    // Validate required fields
    if (!data.parentVideoId || !data.proposedPrompt) {
      return NextResponse.json(
        { error: 'Parent video ID and proposed prompt are required' },
        { status: 400 }
      )
    }
    
    // Create extension proposal
    const proposalResponse = await cosmic.objects.insertOne({
      type: 'extension-proposals',
      title: `Extension: ${data.proposedPrompt.substring(0, 50)}...`,
      metadata: {
        parent_video: data.parentVideoId,
        proposed_prompt: data.proposedPrompt,
        proposed_by: data.proposedBy || 'Anonymous',
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