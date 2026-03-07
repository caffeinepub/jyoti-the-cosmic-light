/**
 * Local-storage persistence for reviews.
 * Temporary solution — backend persistence coming soon.
 */

export const REVIEWS_KEY = "dujyoti_reviews";

export interface LocalReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  service: string;
  createdAt: string; // ISO string
  approved: boolean;
  principalId: string;
  bookingRef?: string;
  isPastClient?: boolean;
}

export function loadLocalReviews(): LocalReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalReview[];
  } catch {
    return [];
  }
}

export function saveLocalReview(review: LocalReview): void {
  const existing = loadLocalReviews();
  // Prevent duplicate IDs
  const filtered = existing.filter((r) => r.id !== review.id);
  filtered.push(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
}

export function approveLocalReview(id: string): void {
  const reviews = loadLocalReviews();
  const updated = reviews.map((r) =>
    r.id === id ? { ...r, approved: true } : r,
  );
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
}

export function deleteLocalReview(id: string): void {
  const reviews = loadLocalReviews();
  const updated = reviews.filter((r) => r.id !== id);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
}
