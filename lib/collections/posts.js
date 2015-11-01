Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function (userId, doc, fields, modifier) {
		return ownsDocument(userId, doc);//...
	},
	remove: function (userId, doc) {
		return ownsDocument(userId, doc);
	}
});

Posts.deny({
	update: function (userId, post, fields) {
		return (_.without(fields, 'url', 'title').length > 0);
	}
});

Meteor.methods({
	postInsert: function(postAttributes) {
		check(Meteor.userId(), String);
		check(postAttributes, {
			title: String,
			url: String
		});

		var postWithSameLink = Posts.findOne({url: postAttributes.url});

		var errors = validatePost(postAttributes);
		if (errors.title || errors.url)
			throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

		if (postWithSameLink) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}

		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date(),
			commentsCount: 0,
			upvoters: [],
			votes: 0
		});
		var postId = Posts.insert(post);

		return {
			_id: postId
		};
	},
	upvote: function(postId) {
		check(this.userId, String);
		check(postId, String);

		Posts.update({
			_id: postId,
			upvoters: {$ne: this.userId}
		}, {
			$addToSet: {upvoters: this.userId},
			$inc: {votes: 1}
		});

		if (! affected) {
			throw new Meteor.error('invalid', "You weren't able to upvote that post");
		}
	}
});

validatePost = function(post) {
	var errors = {};

	if (!post.title)
		errors.title = "Please fill in a headline";

	if (!post.url)
		errors.url = "Please fill in a URL";

	return errors;
};
