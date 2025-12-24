import { redirect } from 'next/navigation'
import { getCurrentUser, getUserById } from '@/lib/auth'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/login')
  }

  const userDetails = await getUserById(currentUser.id)
  
  if (!userDetails) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Profile</h1>
          <p className="text-cosmic-gray-300">
            Manage your account settings and information
          </p>
        </div>

        <div className="card">
          <ProfileForm user={userDetails} />
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">📹 Videos Created</h3>
            <p className="text-4xl font-bold text-cosmic-purple">
              {userDetails.metadata.created_videos || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-3">💡 Proposals Submitted</h3>
            <p className="text-4xl font-bold text-cosmic-blue">
              {userDetails.metadata.created_proposals || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}