import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-b border-cosmic-gray-800 bg-cosmic-dark/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-cosmic-purple to-cosmic-blue bg-clip-text text-transparent">
            🎬 Crowdflix
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/videos" 
              className="text-cosmic-gray-300 hover:text-white transition-colors"
            >
              Videos
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/create" 
                  className="text-cosmic-gray-300 hover:text-white transition-colors"
                >
                  Create
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 text-cosmic-gray-300 hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="text-xl">👤</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-cosmic-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="btn-primary"
                >
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