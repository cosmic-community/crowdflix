import CreateVideoForm from '@/components/CreateVideoForm'

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Create New Video</h1>
          <p className="text-cosmic-gray-300">
            Describe your vision and let Cosmic AI bring it to life using Google's Veo 3.1 models. 
            Your video will be processed asynchronously and available in 30-90 seconds.
          </p>
        </div>

        <div className="card">
          <CreateVideoForm />
        </div>

        {/* Tips Section */}
        <div className="mt-8 card bg-cosmic-gray-900">
          <h3 className="text-xl font-semibold mb-4">💡 Tips for Great Prompts</h3>
          <ul className="space-y-2 text-cosmic-gray-400">
            <li>• Be specific and descriptive about the scene</li>
            <li>• Mention camera angles, lighting, and mood</li>
            <li>• Include action or movement for dynamic videos</li>
            <li>• Avoid references to real people or copyrighted characters</li>
            <li>• Keep it concise - 1-2 sentences work best</li>
          </ul>
        </div>
      </div>
    </div>
  )
}