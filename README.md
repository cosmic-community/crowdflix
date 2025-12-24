# 🎬 Crowdflix: Collaborative AI Video Platform

![App Preview](https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&h=300&fit=crop&auto=format)

A revolutionary crowdsourced AI video creation platform that empowers communities to collaboratively create and extend video stories using Cosmic AI's powerful Veo 3.1 models.

## ✨ Features

- 🎥 **AI Video Generation** - Create videos using Google's Veo 3.1 models (4, 6, or 8 seconds)
- 🤝 **Collaborative Storytelling** - Community members propose and vote on video extensions
- 🔗 **Video Extension Chains** - Track parent-child relationships between connected videos
- 🗳️ **Democratic Voting System** - Upvote favorite proposals with duplicate prevention
- ⚡ **Real-time Processing** - Asynchronous video generation with status tracking
- 📊 **Video Analytics** - View counts and engagement metrics
- 🎯 **Proposal Management** - Four-stage workflow (Pending, Selected, Rejected, Archived)
- 📱 **Responsive Design** - Seamless experience across all devices

## Clone this Project

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=694b2e756d538c4d2c70c387&clone_repository=694b321a6d538c4d2c70c3de)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "I'd like to create a web app called Crowdflix: crowdsourced AI videos. It is a place for people to: 1) Add a new prompt to create a video using Cosmic AI 2) View a page with a movie that includes a form field to add a prompt to EXTEND the video."

### Code Generation Prompt

> "Based on the content model I created for 'I'd like to create a web app called Crowdflix: crowdsourced AI videos. It is a place for people to: 1) Add a new prompt to create a video using Cosmic AI 2) View a page with a movie that includes a form field to add a prompt to EXTEND the video.', now build a complete web application that showcases this content. Include a modern, responsive design with proper navigation, content display, and user-friendly interface. Make sure to use latest Cosmic SDK for AI video generation (1.6.0)"

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **CMS**: Cosmic with AI capabilities
- **AI Models**: Google Veo 3.1 (fast-generate-preview & generate-preview)
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Bun installed on your machine
- A Cosmic account with a bucket set up
- Cosmic bucket with Videos and Extension Proposals object types configured

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crowdflix
```

2. Install dependencies:
```bash
bun install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

5. Run the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Cosmic SDK Examples

### Generate a New Video

```typescript
import { cosmic } from '@/lib/cosmic'

const result = await cosmic.ai.generateVideo({
  prompt: 'A serene mountain landscape at sunset with birds flying',
  duration: 6,
  model: 'veo-3.1-fast-generate-preview'
})

// Create video object in Cosmic
await cosmic.objects.insertOne({
  type: 'videos',
  title: 'Mountain Sunset',
  metadata: {
    original_prompt: 'A serene mountain landscape at sunset',
    duration: 6,
    status: 'processing',
    veo_model_used: 'veo-3.1-fast-generate-preview'
  }
})
```

### Submit Extension Proposal

```typescript
await cosmic.objects.insertOne({
  type: 'extension-proposals',
  title: 'Eagle Flies Through Scene',
  metadata: {
    parent_video: parentVideoId,
    proposed_prompt: 'A majestic eagle soars through the frame',
    proposed_by: 'user@example.com',
    upvote_count: 0,
    status: 'pending',
    voter_ids: []
  }
})
```

### Upvote a Proposal

```typescript
const proposal = await cosmic.objects.findOne({
  type: 'extension-proposals',
  id: proposalId
}).depth(1)

await cosmic.objects.updateOne(proposalId, {
  metadata: {
    upvote_count: (proposal.metadata.upvote_count || 0) + 1,
    voter_ids: [...(proposal.metadata.voter_ids || []), userId]
  }
})
```

## 🎨 Cosmic CMS Integration

This application uses Cosmic's content model with two primary object types:

### Videos Object Type
- **Description**: Rich text description of the video
- **Original Prompt**: The prompt used for AI generation
- **Video File**: The generated video file (uploaded after processing)
- **Duration**: Video length (4, 6, or 8 seconds)
- **Status**: Draft, Processing, Published, or Failed
- **View Count**: Number of views
- **Created By**: Creator's username or email
- **Parent Video**: Link to parent video (for extensions)
- **Veo Model Used**: AI model identifier
- **Generation Time**: Processing time in seconds

### Extension Proposals Object Type
- **Parent Video**: Link to the video being extended
- **Proposed Prompt**: Community-submitted extension prompt
- **Proposed By**: Username or email of proposer
- **Upvote Count**: Number of upvotes received
- **Status**: Pending, Selected, Rejected, or Archived
- **Voter IDs**: Array of user IDs who voted (prevents duplicates)
- **Notes**: Optional explanation of the proposal

## 📱 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables:
   - `COSMIC_BUCKET_SLUG`
   - `COSMIC_READ_KEY`
   - `COSMIC_WRITE_KEY`
4. Deploy

The application will automatically use Vercel's edge network for optimal performance.

## 🔐 Environment Variables

```env
# Required
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

## 📚 Learn More

- [Cosmic Documentation](https://www.cosmicjs.com/docs)
- [Cosmic AI API Documentation](https://www.cosmicjs.com/docs/api/ai)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

<!-- README_END -->