'use client'

import { Video } from '@/types'
import { useState } from 'react'

interface RevisionHistoryProps {
  revisions: Video[]
}

export default function RevisionHistory({ revisions }: RevisionHistoryProps) {
  // Changed: Filter out undefined IDs and create Set<string>
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(
    new Set(revisions.map(r => r.id).filter((id): id is string => typeof id === 'string'))
  )

  const toggleVideo = (videoId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      {revisions.map((revision, index) => {
        const isLatest = index === 0
        const videoUrl = revision.metadata?.video_file?.url
        const thumbnail = revision.thumbnail
          ? `${revision.thumbnail}?w=800&h=450&fit=crop&auto=format,compress`
          : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&h=450&fit=crop&auto=format'
        const isPlaying = playingVideos.has(revision.id)

        return (
          <div key={revision.id} className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                {isLatest ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cosmic-purple text-white">
                    ✨ Latest
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cosmic-gray-800 text-cosmic-gray-400">
                    Revision {revisions.length - index}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{revision.title}</h3>
                <div className="flex items-center gap-4 text-sm text-cosmic-gray-400">
                  {revision.metadata?.duration && (
                    <span>⏱️ {revision.metadata.duration}s</span>
                  )}
                  {revision.metadata?.created_by && (
                    <span>👤 {revision.metadata.created_by}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden bg-cosmic-gray-900 mb-4">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  poster={thumbnail}
                  onPlay={() => {
                    if (!isPlaying) {
                      toggleVideo(revision.id)
                    }
                  }}
                  onPause={() => {
                    if (isPlaying) {
                      toggleVideo(revision.id)
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={thumbnail}
                    alt={revision.title}
                    className="w-full h-full object-cover opacity-50"
                    width={400}
                    height={225}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-cosmic-gray-400">Video processing...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card bg-cosmic-gray-900">
              <h4 className="font-semibold mb-2">
                {isLatest ? 'Current Prompt:' : 'Extension Prompt:'}
              </h4>
              <p className="text-cosmic-gray-400 italic">
                "{revision.metadata?.original_prompt}"
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}