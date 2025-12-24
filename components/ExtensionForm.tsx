'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExtensionFormProps {
  videoId: string
}

export default function ExtensionForm({ videoId }: ExtensionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    proposedPrompt: '',
    proposedBy: '',
    notes: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.proposedPrompt.trim()) {
      alert('Please enter a prompt for the extension')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/proposals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentVideoId: videoId,
          proposedPrompt: formData.proposedPrompt,
          proposedBy: formData.proposedBy || 'Anonymous',
          notes: formData.notes,
        }),
      })
      
      if (response.ok) {
        alert('Extension proposal submitted successfully!')
        setFormData({ proposedPrompt: '', proposedBy: '', notes: '' })
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit proposal')
      }
    } catch (error) {
      console.error('Error submitting proposal:', error)
      alert('Failed to submit proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="proposedPrompt">
          Extension Prompt *
        </label>
        <textarea
          id="proposedPrompt"
          value={formData.proposedPrompt}
          onChange={(e) => setFormData({ ...formData, proposedPrompt: e.target.value })}
          placeholder="Describe how you want the story to continue..."
          className="textarea-field"
          rows={4}
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-cosmic-gray-500 mt-1">
          Be specific about what happens next in the story
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="notes">
          Why this extension? (Optional)
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Explain your reasoning or creative vision..."
          className="textarea-field"
          rows={2}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" htmlFor="proposedBy">
          Your Name or Email (Optional)
        </label>
        <input
          type="text"
          id="proposedBy"
          value={formData.proposedBy}
          onChange={(e) => setFormData({ ...formData, proposedBy: e.target.value })}
          placeholder="Anonymous"
          className="input-field"
          disabled={isSubmitting}
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Proposal'}
      </button>
    </form>
  )
}