'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ExtensionFormProps {
  videoId: string
}

export default function ExtensionForm({ videoId }: ExtensionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    proposedPrompt: '',
    notes: '',
  })
  
  // Check authentication status on component mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        setIsAuthenticated(data.success)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('You must be logged in to submit extension proposals')
      router.push(`/login?redirect=/videos/${videoId}`)
      return
    }
    
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
          notes: formData.notes,
        }),
      })
      
      if (response.ok) {
        alert('Extension proposal submitted successfully!')
        setFormData({ proposedPrompt: '', notes: '' })
        router.refresh()
      } else if (response.status === 401) {
        alert('You must be logged in to submit extension proposals')
        router.push(`/login?redirect=/videos/${videoId}`)
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
  
  if (isCheckingAuth) {
    return (
      <div className="card">
        <p className="text-center text-cosmic-gray-400">Loading...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="card text-center">
        <p className="text-cosmic-gray-400 mb-4">You must be logged in to submit extension proposals.</p>
        <button
          onClick={() => router.push(`/login?redirect=/videos/${videoId}`)}
          className="btn-primary"
        >
          Log In
        </button>
      </div>
    )
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