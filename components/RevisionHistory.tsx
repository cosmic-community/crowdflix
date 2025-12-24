'use client'

import { Video } from '@/types'
import { useState } from 'react'

interface RevisionHistoryProps {
  revisions: Video[]
}

export default function RevisionHistory({ revisions }: RevisionHistoryProps) {
  // Changed: Filter out undefined IDs to ensure Set<string> type
  const initialId = revisions[0]?.id
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(
    new Set(initialId ? [initialId] : [])
  )
  
  const toggleRevision = (videoId: string) => {
    setExpandedRevisions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }
  
  // Revisions are already in order from newest to oldest
  return (
    <div className="space-y-4">
      {revisions.map((revision, index) => {
        const isLatest = index === 0
        const isOriginal = index === revisions.length - 1
        const isExpanded = expandedRevisions.has(revision.id)
        const videoUrl = revision.metadata?.video_file?.url
        const thumbnail = revision.thumbnail
          ? `${revision.thumbnail}?w=800&h=450&fit=crop&auto=format,compress`
          : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=450&fit=crop&auto=format'
        
        return (
          <div 
            key={revision.id}
            className={`card ${isLatest ? 'border-2 border-cosmic-purple' : 'border border-cosmic-gray-800'}`}
          >
            {/* Revision Header */}
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => toggleRevision(revision.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {isLatest ? '🎬' : isOriginal ? '🌟' : '📼'}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">
                      {isLatest && 'Latest: '}
                      {isOriginal ? 'Original Video' : `Extension ${revisions.length - index}`}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-cosmic-gray-400">
                      {revision.metadata.created_by && (
                        <span>👤 {revision.metadata.created_by}</span>
                      )}
                      {revision.metadata.duration && (
                        <span>⏱️ {revision.metadata.duration}s</span>
                      )}
                      {revision.metadata.generation_time && (
                        <span>⚡ {revision.metadata.generation_time}s generation</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-cosmic-gray-900 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-cosmic-purple mb-1">
                    {isOriginal ? 'Original Prompt:' : 'Extension Prompt:'}
                  </p>
                  <p className="text-cosmic-gray-300 italic">
                    "{revision.metadata.original_prompt}"
                  </p>
                </div>
              </div>
              
              <button 
                className="ml-4 text-cosmic-gray-400 hover:text-white transition-colors"
                aria-label={isExpanded ? 'Collapse video' : 'Expand video'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            </div>
            
            {/* Expandable Video Player */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-cosmic-gray-800">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-cosmic-gray-900">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      poster={thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                      <img
                        src={thumbnail}
                        alt={revision.title}
                        className="w-full h-full object-cover opacity-50"
                        width={800}
                        height={450}
                      />
                      <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-purple"></div>
                        <p className="text-cosmic-gray-400">Video is processing...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {revision.metadata.description && (
                  <div className="mt-3 text-sm text-cosmic-gray-400">
                    <p className="font-semibold text-cosmic-gray-300 mb-1">Description:</p>
                    <p>{revision.metadata.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}