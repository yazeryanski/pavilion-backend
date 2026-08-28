/**
 * A single stored newsletter entry. The `posts` JSON column on the Newsletter model is an
 * ordered array (newest first) of these.
 */
export interface NewsletterEntry {
	postId: string;
	authorId: string;
}
