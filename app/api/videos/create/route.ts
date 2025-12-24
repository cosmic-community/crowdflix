import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { CreateVideoFormData } from '@/types'

// Extend serverless function timeout to 5 minutes (300 seconds)
// This allows the function to wait for video generation to complete
// Maximum duration for Vercel Pro plan
export const maxDuration = 300

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
    
    // Validate cosmic.ai is available
    if (!cosmic.ai || typeof cosmic.ai.generateVideo !== 'function') {
      console.error('[VIDEO_CREATE] Cosmic AI is not available:', {
        hasAI: !!cosmic.ai,
        aiType: typeof cosmic.ai,
        hasGenerateVideo: cosmic.ai ? typeof cosmic.ai.generateVideo : 'N/A'
      })
      return NextResponse.json(
        { error: 'Video generation service is not available. Please check Cosmic AI configuration.' },
        { status: 503 }
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
        status: { key: 'processing', value: 'Processing' },
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
    console.log('[VIDEO_CREATE] Generation parameters:', {
      prompt: data.prompt,
      duration: data.duration,
      model: 'veo-3.1-fast-generate-preview'
    })
    const generationStartTime = Date.now()
    
    await cosmic.ai.generateVideo({
      prompt: data.prompt,
      duration: data.duration,
      model: 'veo-3.1-fast-generate-preview',
    }).then(async (result) => {
      const generationTime = Date.now() - generationStartTime
      console.log('[VIDEO_CREATE] Video generation completed:', {
        videoId,
        generationTime: generationTime + 'ms',
        result: JSON.stringify(result, null, 2),
        hasMedia: !!result.media,
        mediaName: result.media?.name,
        mediaType: typeof result.media
      })
      
      // Update video with generated file
      if (result.media && result.media.name) {
        console.log('[VIDEO_CREATE] Updating Cosmic object with video file:', {
          videoId,
          mediaName: result.media.name
        })
        try {
          const updateResult = await cosmic.objects.updateOne(videoId, {
            metadata: {
              video_file: result.media.name,
              status: { key: 'published', value: 'Published' },
              generation_time: Math.floor(generationTime / 1000),
            }
          })
          console.log('[VIDEO_CREATE] Video published successfully:', {
            videoId,
            updateResult: JSON.stringify(updateResult, null, 2)
          })
        } catch (updateError) {
          console.error('[VIDEO_CREATE] Failed to update video with file:', {
            videoId,
            error: updateError instanceof Error ? updateError.message : String(updateError),
            errorStack: updateError instanceof Error ? updateError.stack : undefined,
            errorType: typeof updateError
          })
        }
      } else {
        console.warn('[VIDEO_CREATE] No media returned from generation:', {
          videoId,
          result: JSON.stringify(result, null, 2),
          hasResult: !!result,
          resultKeys: result ? Object.keys(result) : [],
          mediaValue: result.media,
          mediaType: typeof result.media
        })
        
        // Update status to failed if no media
        try {
          await cosmic.objects.updateOne(videoId, {
            metadata: {
              status: { key: 'failed', value: 'Failed' },
            }
          })
          console.log('[VIDEO_CREATE] Video status updated to failed (no media):', videoId)
        } catch (updateError) {
          console.error('[VIDEO_CREATE] Failed to update video status:', {
            videoId,
            error: updateError
          })
        }
      }
    }).catch(async (error) => {
      const generationTime = Date.now() - generationStartTime
      console.error('[VIDEO_CREATE] Video generation failed:', {
        videoId,
        generationTime: generationTime + 'ms',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      })
      
      // Update status to failed
      try {
        await cosmic.objects.updateOne(videoId, {
          metadata: {
            status: { key: 'failed', value: 'Failed' },
          }
        })
        console.log('[VIDEO_CREATE] Video status updated to failed:', videoId)
      } catch (updateError) {
        console.error('[VIDEO_CREATE] Failed to update video status to failed:', {
          videoId,
          error: updateError instanceof Error ? updateError.message : String(updateError),
          errorStack: updateError instanceof Error ? updateError.stack : undefined
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
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      totalTime: totalTime + 'ms'
    })
    
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}