import SignupForm from '@/components/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Join Crowdflix</h1>
          <p className="text-cosmic-gray-300">
            Create your account and start making videos
          </p>
        </div>

        <div className="card">
          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-cosmic-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cosmic-purple hover:text-cosmic-blue transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}