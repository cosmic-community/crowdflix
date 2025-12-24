import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-cosmic-gray-300">
            Log in to continue creating amazing videos
          </p>
        </div>

        <div className="card">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-cosmic-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-cosmic-purple hover:text-cosmic-blue transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}