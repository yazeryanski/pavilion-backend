/*
	RabbitMQ message contract for post lifecycle events.

	The `post` service is the (future) publisher of `post.published`; this service is the
	consumer. Both sides must agree on this shape and these routing values — if/when the
	publisher is implemented in `post`, duplicate this contract there.
*/

export interface PostPublishedEvent {
	postId: string;
	authorId: string;
}

// RabbitMQ topology for post lifecycle events.
export const POST_EXCHANGE = 'post.events';
export const POST_PUBLISHED_ROUTING_KEY = 'post.published';
