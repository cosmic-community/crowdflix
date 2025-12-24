import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { CreateVideoFormData } from '@/types'

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('[VIDEO_CREATE] Request received at:', new Date().toISOString())
  
  try {
    const data: CreateVideoFormData = await request.json()
    console.log('[VIDEO_CREATE] Request data:', {
      promptLength: data.prompt?.length,
      duration: data.duration,
      hasDescription: !!data.description,
      createdBy: data.createdBy || 'Anonymous'
    })
    
    // Validate required fields
    if (!data.prompt || !data.duration) {
      console.error('[VIDEO_CREATE] Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'Prompt and duration are required' },
        { status: 400 }
      )
    }
    
    console.log('[VIDEO_CREATE] Creating Cosmic object...')
    // Create video object with processing status
    const videoResponse = await cosmic.objects.insertOne({
      type: 'videos',
      title: data.prompt.substring(0, 60) + (data.prompt.length > 60 ? '...' : ''),
      metadata: {
        original_prompt: data.prompt,
        duration: data.duration,
        description: data.description || '',
        created_by: data.createdBy || 'Anonymous',
        status: 'processing',
        view_count: 0,
        parent_video: null,
        veo_model_used: 'veo-3.1-fast-generate-preview',
      }
    })
    
    const videoId = videoResponse.object.id
    console.log('[VIDEO_CREATE] Cosmic object created:', {
      videoId,
      createdAt: videoResponse.object.created_at,
      timeTaken: Date.now() - startTime + 'ms'
    })
    
    // Start video generation asynchronously
    console.log('[VIDEO_CREATE] Starting video generation...')
    const generationStartTime = Date.now()
    
    cosmic.ai.generateVideo({
      prompt: data.prompt,
      duration: data.duration,
      model: 'veo-3.1-fast-generate-preview',
    }).then(async (result) => {
      const generationTime = Date.now() - generationStartTime
      console.log('[VIDEO_CREATE] Video generation completed:', {
        videoId,
        generationTime: generationTime + 'ms',
        hasMedia: !!result.media,
        mediaName: result.media?.name
      })
      
      // Update video with generated file
      if (result.media && result.media.name) {
        console.log('[VIDEO_CREATE] Updating Cosmic object with video file...')
        try {
          await cosmic.objects.updateOne(videoId, {
            metadata: {
              video_file: result.media.name,
              status: 'published',
              generation_time: Math.floor(generationTime / 1000),
            }
          })
          console.log('[VIDEO_CREATE] Video published successfully:', videoId)
        } catch (updateError) {
          console.error('[VIDEO_CREATE] Failed to update video with file:', {
            videoId,
            error: updateError
          })
        }
      } else {
        console.warn('[VIDEO_CREATE] No media returned from generation:', {
          videoId,
          result: JSON.stringify(result)
        })
      }
    }).catch(async (error) => {
      const generationTime = Date.now() - generationStartTime
      console.error('[VIDEO_CREATE] Video generation failed:', {
        videoId,
        generationTime: generationTime + 'ms',
        error: error.message || error,
        errorStack: error.stack
      })
      
      // Update status to failed
      try {
        await cosmic.objects.updateOne(videoId, {
          metadata: {
            status: 'failed',
          }
        })
        console.log('[VIDEO_CREATE] Video status updated to failed:', videoId)
      } catch (updateError) {
        console.error('[VIDEO_CREATE] Failed to update video status to failed:', {
          videoId,
          error: updateError
        })
      }
    })
    
    const totalTime = Date.now() - startTime
    console.log('[VIDEO_CREATE] Response sent:', {
      videoId,
      status: 'processing',
      totalTime: totalTime + 'ms'
    })
    
    return NextResponse.json({
      videoId,
      status: 'processing',
      message: 'Video generation started. Check back in 30-90 seconds.',
    })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error('[VIDEO_CREATE] Error creating video:', {
      error: error instanceof Error ? error.message : error,
      errorStack: error instanceof Error ? error.stack : undefined,
      totalTime: totalTime + 'ms'
    })
    
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}