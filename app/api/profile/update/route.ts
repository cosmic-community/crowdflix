import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { getCurrentUser } from '@/lib/auth'
import { UpdateProfileFormData } from '@/types'

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data: UpdateProfileFormData = await request.json()
    
    // Build update payload with only provided fields
    const metadata: Record<string, any> = {}
    
    if (data.name !== undefined) {
      metadata.name = data.name
    }
    
    if (data.bio !== undefined) {
      metadata.bio = data.bio
    }

    // Update user profile
    await cosmic.objects.updateOne(user.id, {
      title: data.name || user.name,
      metadata
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}