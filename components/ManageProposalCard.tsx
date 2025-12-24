'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExtensionProposal } from '@/types'

interface ManageProposalCardProps {
  proposal: ExtensionProposal
  videoId: string
}

export default function ManageProposalCard({ proposal, videoId }: ManageProposalCardProps) {
  const router = useRouter()
  const [isSelecting, setIsSelecting] = useState(false)
  const upvotes = proposal.metadata?.upvote_count || 0
  
  const handleSelect = async () => {
    if (isSelecting) return
    
    const confirmed = confirm(
      `Are you sure you want to select this proposal?\n\n` +
      `"${proposal.metadata?.proposed_prompt}"\n\n` +
      `This will:\n` +
      `1. Generate a new video extension using AI\n` +
      `2. Replace the current video with the extended version\n` +
      `3. Archive all other pending proposals\n\n` +
      `This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    setIsSelecting(true)
    
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        router.refresh()
      } else {
        alert(data.error || 'Failed to select proposal')
        setIsSelecting(false)
      }
    } catch (error) {
      console.error('Error selecting proposal:', error)
      alert('Failed to select proposal. Please try again.')
      setIsSelecting(false)
    }
  }
  
  return (
    <div className="card border-2 border-cosmic-gray-800 hover:border-cosmic-purple/50 transition-colors">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="text-sm font-semibold text-cosmic-purple">
              {upvotes} {upvotes === 1 ? 'vote' : 'votes'}
            </span>
          </div>
          {proposal.metadata?.proposed_by && (
            <span className="text-xs text-cosmic-gray-500">
              by {proposal.metadata.proposed_by}
            </span>
          )}
        </div>
        
        <p className="text-cosmic-gray-300 mb-3">
          "{proposal.metadata?.proposed_prompt}"
        </p>
        
        {proposal.metadata?.notes && (
          <p className="text-sm text-cosmic-gray-400 italic border-l-2 border-cosmic-purple pl-3">
            {proposal.metadata.notes}
          </p>
        )}
      </div>
      
      <button
        onClick={handleSelect}
        disabled={isSelecting}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isSelecting 
            ? 'bg-cosmic-gray-700 text-cosmic-gray-400 cursor-wait'
            : 'bg-cosmic-purple hover:bg-cosmic-blue text-white hover:shadow-lg hover:scale-105'
        }`}
      >
        {isSelecting ? '🎬 Generating Video...' : '✅ Select & Generate Extension'}
      </button>
      
      {isSelecting && (
        <p className="text-xs text-cosmic-gray-400 text-center mt-3">
          This may take 30-90 seconds. Please wait...
        </p>
      )}
    </div>
  )
}