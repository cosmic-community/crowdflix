'use client'

import { useState } from 'react'
import { ExtensionProposal } from '@/types'

interface ProposalCardProps {
  proposal: ExtensionProposal
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const [upvotes, setUpvotes] = useState(proposal.metadata?.upvote_count || 0)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async () => {
    if (hasVoted || isVoting) return
    
    setIsVoting(true)
    
    try {
      // Generate a simple user ID (in production, use proper authentication)
      const userId = localStorage.getItem('crowdflix_user_id') || 
        `user_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('crowdflix_user_id', userId)
      
      const response = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvote_count)
        setHasVoted(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }
  
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-cosmic-gray-300 mb-2 line-clamp-3">
            "{proposal.metadata?.proposed_prompt}"
          </p>
          {proposal.metadata?.proposed_by && (
            <p className="text-sm text-cosmic-gray-500">
              Proposed by {proposal.metadata.proposed_by}
            </p>
          )}
        </div>
      </div>
      
      {proposal.metadata?.notes && (
        <p className="text-sm text-cosmic-gray-400 italic mb-4 border-l-2 border-cosmic-purple pl-3">
          {proposal.metadata.notes}
        </p>
      )}
      
      <button
        onClick={handleVote}
        disabled={hasVoted || isVoting}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
          hasVoted 
            ? 'bg-cosmic-gray-700 text-cosmic-gray-400 cursor-not-allowed'
            : 'bg-cosmic-purple hover:bg-cosmic-blue text-white'
        }`}
      >
        {isVoting ? '⏳ Voting...' : hasVoted ? '✅ Voted' : `🔼 Upvote (${upvotes})`}
      </button>
    </div>
  )
}