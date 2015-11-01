Notifications = new Mongo.Collection('notifications');

Notifications.allow({
	update: function (userId, doc, fields, modifier) {
		return ownsDocument(userId, doc) &&
			fields.length === 1 && fields[0] === 'read';
	}
});

createCommentNotifications = function(comment) {
	var post = Posts.findOne(comment.postId);

	if (comment.userId !== post.userId) {
		Notifications.insert({
			userId: post.userId,
			postId: post._id,
			commentId: comment._id,
			commenterName: comment.author,
			read: false
		});
	}
};
