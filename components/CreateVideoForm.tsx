'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateVideoForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    prompt: '',
    duration: 6 as 4 | 6 | 8,
    description: '',
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
      alert('You must be logged in to create videos')
      router.push('/login?redirect=/create')
      return
    }
    
    if (!formData.prompt.trim()) {
      alert('Please enter a prompt for your video')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/videos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const data = await response.json()
        alert('Video creation started! Processing will take 30-90 seconds.')
        router.push('/videos')
      } else if (response.status === 401) {
        alert('You must be logged in to create videos')
        router.push('/login?redirect=/create')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create video')
      }
    } catch (error) {
      console.error('Error creating video:', error)
      alert('Failed to create video. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isCheckingAuth) {
    return (
      <div className="text-center py-8">
        <p className="text-cosmic-gray-400">Loading...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-cosmic-gray-400 mb-4">You must be logged in to create videos.</p>
        <button
          onClick={() => router.push('/login?redirect=/create')}
          className="btn-primary"
        >
          Log In
        </button>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" htmlFor="prompt">
          Video Prompt *
        </label>
        <textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          placeholder="A lone spaceship pilot discovers an ancient alien artifact floating in deep space..."
          className="textarea-field"
          rows={4}
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-cosmic-gray-500 mt-1">
          Describe the scene you want to create in detail
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" htmlFor="duration">
          Duration *
        </label>
        <select
          id="duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) as 4 | 6 | 8 })}
          className="input-field"
          required
          disabled={isSubmitting}
        >
          <option value={4}>4 seconds</option>
          <option value={6}>6 seconds (Recommended)</option>
          <option value={8}>8 seconds</option>
        </select>
        <p className="text-sm text-cosmic-gray-500 mt-1">
          Longer videos take more time to generate
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" htmlFor="description">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add context or background for your video..."
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
        {isSubmitting ? '⏳ Creating Video...' : '✨ Generate Video'}
      </button>
      
      <p className="text-sm text-cosmic-gray-500 mt-4 text-center">
        Video generation takes 30-90 seconds. You'll be redirected to the videos page.
      </p>
    </form>
  )
}