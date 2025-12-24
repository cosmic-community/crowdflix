// Base Cosmic object interface
export interface CosmicObject {
    id: string;
    slug: string;
    title: string;
    content?: string;
    metadata: Record<string, any>;
    type: string;
    created_at: string;
    modified_at: string;
    thumbnail?: string;
}

// Video status type literals - MUST match content model exactly
export type VideoStatus = 'draft' | 'processing' | 'published' | 'failed';

// Extension proposal status type literals - MUST match content model exactly
export type ProposalStatus = 'pending' | 'selected' | 'rejected' | 'archived';

// Video object type with properly typed metadata
export interface Video extends CosmicObject {
    type: 'videos';
    metadata: {
      description?: string;
      original_prompt: string;
      video_file?: {
        url: string;
        imgix_url: string;
      } | null;
      duration?: number;
      status: {
        key: VideoStatus;
        value: string;
      };
      view_count?: number;
      created_by?: string;
      parent_video?: Video | null;
      veo_model_used?: string;
      generation_time?: number;
    };
}

// Extension Proposal object type with properly typed metadata
export interface ExtensionProposal extends CosmicObject {
    type: 'extension-proposals';
    metadata: {
      parent_video: Video;
      proposed_prompt: string;
      proposed_by?: string;
      upvote_count?: number;
      status: {
        key: ProposalStatus;
        value: string;
      };
      voter_ids?: string[];
      notes?: string;
    };
}

// User object type with properly typed metadata
export interface User extends CosmicObject {
    type: 'users';
    metadata: {
      email: string;
      password_hash: string;
      name: string;
      bio?: string;
      avatar?: {
        url: string;
        imgix_url: string;
      } | null;
      created_videos?: number;
      created_proposals?: number;
    };
}

// API response types
export interface CosmicResponse<T> {
    objects: T[];
    total: number;
    limit?: number;
    skip?: number;
}

// Type guards for runtime validation
export function isVideo(obj: CosmicObject): obj is Video {
    return obj.type === 'videos';
}

export function isExtensionProposal(obj: CosmicObject): obj is ExtensionProposal {
    return obj.type === 'extension-proposals';
}

export function isUser(obj: CosmicObject): obj is User {
    return obj.type === 'users';
}

// Form data types
export interface CreateVideoFormData {
    prompt: string;
    duration: 4 | 6 | 8;
    description?: string;
    createdBy?: string;
}

export interface CreateProposalFormData {
    parentVideoId: string;
    proposedPrompt: string;
    proposedBy?: string;
    notes?: string;
}

// Authentication form data types
export interface SignupFormData {
    name: string;
    email: string;
    password: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface UpdateProfileFormData {
    name?: string;
    bio?: string;
}

// Video generation result type
export interface VideoGenerationResult {
    videoId: string;
    status: VideoStatus;
    message: string;
}

// Authentication response types
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

// Session user type
export interface SessionUser {
    id: string;
    name: string;
    email: string;
}