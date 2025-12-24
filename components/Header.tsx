'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.success) {
          setIsAuthenticated(true)
          setUserName(data.user.name)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setUserName('')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header className="bg-cosmic-gray-900 border-b border-cosmic-gray-800 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Crowdflix
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/videos" className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors">
              Videos
            </Link>
            <Link href="/create" className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors">
              Create
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/manage" className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors">
                  Manage
                </Link>
                <Link href="/profile" className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors"
                >
                  Logout
                </button>
                <span className="text-cosmic-gray-500 text-sm">
                  {userName}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className="text-cosmic-gray-300 hover:text-cosmic-purple transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}