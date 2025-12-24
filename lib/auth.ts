import { cookies } from 'next/headers'
import { cosmic } from './cosmic'
import { User, SessionUser } from '@/types'

// Simple password hashing using Web Crypto API (browser/Node.js compatible)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Compare password with hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return session.user || null
  } catch (error) {
    console.error('Error parsing session:', error)
    return null
  }
}

// Create session for user
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  const session = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
  
  cookieStore.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

// Destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'users',
        'metadata.email': email
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(0)
    
    if (!response.objects || response.objects.length === 0) {
      return null
    }
    
    return response.objects[0] as User
  } catch (error: any) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await cosmic.objects
      .findOne({ 
        id: userId
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(0)
    
    return response.object as User
  } catch (error: any) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}