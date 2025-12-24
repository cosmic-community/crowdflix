import { NextResponse } from 'next/server'
import { verifyPassword, createSession, getUserByEmail } from '@/lib/auth'
import { LoginFormData, AuthResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const data: LoginFormData = await request.json()
    
    // Validate required fields
    if (!data.email || !data.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' } as AuthResponse,
        { status: 400 }
      )
    }

    // Find user by email
    const user = await getUserByEmail(data.email)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' } as AuthResponse,
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.metadata.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' } as AuthResponse,
        { status: 401 }
      )
    }

    // Create session
    await createSession({
      id: user.id,
      name: user.metadata.name,
      email: user.metadata.email
    })

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        name: user.metadata.name,
        email: user.metadata.email
      }
    } as AuthResponse)
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to log in' } as AuthResponse,
      { status: 500 }
    )
  }
}