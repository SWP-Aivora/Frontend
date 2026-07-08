export interface CreateReviewRequest {
  projectId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string | null;
  communicationRating?: number | null;
  qualityRating?: number | null;
  deadlineRating?: number | null;
  requirementClarityRating?: number | null;
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  communicationRating?: number | null;
  qualityRating?: number | null;
  deadlineRating?: number | null;
  requirementClarityRating?: number | null;
  createdAt: string;
  reviewerName?: string;
  revieweeName?: string;
}

export interface UserReviewsResponse {
  items: Review[];
  totalCount: number;
}
