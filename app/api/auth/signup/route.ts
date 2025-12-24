import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { hashPassword, createSession, getUserByEmail } from '@/lib/auth'
import { SignupFormData, AuthResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const data: SignupFormData = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' } as AuthResponse,
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' } as AuthResponse,
        { status: 400 }
      )
    }

    // Validate password length
    if (data.password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' } as AuthResponse,
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' } as AuthResponse,
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create user in Cosmic
    const userResponse = await cosmic.objects.insertOne({
      type: 'users',
      title: data.name,
      metadata: {
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        bio: '',
        created_videos: 0,
        created_proposals: 0
      }
    })

    // Create session
    await createSession({
      id: userResponse.object.id,
      name: data.name,
      email: data.email
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: userResponse.object.id,
        name: data.name,
        email: data.email
      }
    } as AuthResponse)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create account' } as AuthResponse,
      { status: 500 }
    )
  }
}