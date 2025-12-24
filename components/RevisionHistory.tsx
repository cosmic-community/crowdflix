'use client'

import { Video } from '@/types'
import { useState } from 'react'

interface RevisionHistoryProps {
  revisions: Video[]
}

export default function RevisionHistory({ revisions }: RevisionHistoryProps) {
  // Changed: Filter out undefined video files before creating the Set
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(
    new Set(
      revisions
        .map(r => r.metadata.video_file?.url)
        .filter((url): url is string => url !== undefined)
    )
  )

  const toggleVideo = (videoUrl: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(videoUrl)) {
        newSet.delete(videoUrl)
      } else {
        newSet.add(videoUrl)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      {revisions.map((revision, index) => {
        const videoUrl = revision.metadata.video_file?.url
        const isPlaying = videoUrl ? playingVideos.has(videoUrl) : false
        const revisionNumber = revisions.length - index
        const isLatest = index === 0

        return (
          <div key={revision.id} className="card">
            <div className="flex items-start gap-4">
              {/* Revision Number Badge */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  isLatest ? 'bg-cosmic-purple text-white' : 'bg-cosmic-gray-800 text-cosmic-gray-400'
                }`}>
                  {revisionNumber}
                </div>
              </div>

              {/* Video Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">
                    {isLatest ? '🎬 Latest Version' : `Version ${revisionNumber}`}
                  </h3>
                  {revision.metadata.duration && (
                    <span className="text-sm text-cosmic-gray-400">
                      ({revision.metadata.duration}s)
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="mb-4 p-3 bg-cosmic-gray-900 rounded-lg">
                  <p className="text-sm text-cosmic-gray-500 mb-1">Prompt:</p>
                  <p className="text-cosmic-gray-300 italic">"{revision.metadata.original_prompt}"</p>
                </div>

                {/* Video Player */}
                {videoUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-cosmic-gray-900">
                    <video
                      src={videoUrl}
                      controls={isPlaying}
                      className="w-full h-full"
                      poster={revision.thumbnail ? `${revision.thumbnail}?w=600&h=337&fit=crop&auto=format,compress` : undefined}
                      onPlay={() => !isPlaying && toggleVideo(videoUrl)}
                      onPause={() => isPlaying && toggleVideo(videoUrl)}
                    >
                      Your browser does not support the video tag.
                    </video>
                    {!isPlaying && (
                      <button
                        onClick={() => toggleVideo(videoUrl)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
                      >
                        <div className="w-16 h-16 rounded-full bg-cosmic-purple flex items-center justify-center">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-cosmic-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-purple mx-auto mb-3"></div>
                      <p className="text-cosmic-gray-400">Video processing...</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-3 flex items-center gap-4 text-sm text-cosmic-gray-500">
                  {revision.metadata.created_by && (
                    <span>👤 {revision.metadata.created_by}</span>
                  )}
                  {revision.metadata.veo_model_used && (
                    <span>🤖 {revision.metadata.veo_model_used}</span>
                  )}
                  {revision.metadata.generation_time && (
                    <span>⚡ {revision.metadata.generation_time}s generation</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}