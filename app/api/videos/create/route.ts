import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { CreateVideoFormData } from '@/types'

export async function POST(request: Request) {
  try {
    const data: CreateVideoFormData = await request.json()
    
    // Validate required fields
    if (!data.prompt || !data.duration) {
      return NextResponse.json(
        { error: 'Prompt and duration are required' },
        { status: 400 }
      )
    }
    
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
    
    // Start video generation asynchronously
    cosmic.ai.generateVideo({
      prompt: data.prompt,
      duration: data.duration,
      model: 'veo-3.1-fast-generate-preview',
    }).then(async (result) => {
      // Update video with generated file
      if (result.media && result.media.name) {
        await cosmic.objects.updateOne(videoId, {
          metadata: {
            video_file: result.media.name,
            status: 'published',
            generation_time: Math.floor((Date.now() - new Date(videoResponse.object.created_at).getTime()) / 1000),
          }
        })
      }
    }).catch(async (error) => {
      console.error('Video generation failed:', error)
      // Update status to failed
      await cosmic.objects.updateOne(videoId, {
        metadata: {
          status: 'failed',
        }
      })
    })
    
    return NextResponse.json({
      videoId,
      status: 'processing',
      message: 'Video generation started. Check back in 30-90 seconds.',
    })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}