'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExtensionProposal } from '@/types'

interface ProposalCardProps {
  proposal: ExtensionProposal
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const router = useRouter()
  const [upvotes, setUpvotes] = useState(proposal.metadata?.upvote_count || 0)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Check authentication and voting status
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.success) {
          setIsAuthenticated(true)
          setCurrentUserId(data.user.id)
          // Check if current user has already voted
          const voterIds = proposal.metadata?.voter_ids || []
          setHasVoted(voterIds.includes(data.user.id))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      }
    }
    checkAuth()
  }, [proposal.metadata?.voter_ids])
  
  const handleVote = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to vote on proposals')
      router.push('/login')
      return
    }
    
    if (hasVoted || isVoting) return
    
    setIsVoting(true)
    
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvote_count)
        setHasVoted(true)
      } else if (response.status === 401) {
        alert('You must be logged in to vote on proposals')
        router.push('/login')
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
        disabled={hasVoted || isVoting || !isAuthenticated}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
          hasVoted 
            ? 'bg-cosmic-gray-700 text-cosmic-gray-400 cursor-not-allowed'
            : !isAuthenticated
            ? 'bg-cosmic-gray-800 text-cosmic-gray-400 hover:bg-cosmic-gray-700'
            : 'bg-cosmic-purple hover:bg-cosmic-blue text-white'
        }`}
      >
        {isVoting ? '⏳ Voting...' : hasVoted ? '✅ Voted' : !isAuthenticated ? `🔼 Log in to vote (${upvotes})` : `🔼 Upvote (${upvotes})`}
      </button>
    </div>
  )
}