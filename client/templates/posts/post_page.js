Template.postPage.helpers({
	comments: function () {
		return Comments.find({postId: this._id});
	}
});

Template.postsList.onRendered(function() {
	this.find('.wrapper')._uihooks = {
		insertElement: function(node, next) {
			$(node)
				.hide()
				.insertBefore(next)
				.fadeIn();
		},
		removeElement: function(node) {
			$(node).fadeOut(function() {
				$(this).remove();
			});
		},
		moveElement: function(node, next) {
			var $node = $(node), $next = $(next);
			var oldTop = $node.offset().top;
			var height = $node.outerHeight(true);

			// find all elements beetween node and next
			var $inBetween = $next.nextUntil(node);
			if ($inBetween.length ===0)
				$inBetween = $node.nextUntil(next);

			//now put node in place
			$node.insertBefore(next);

			//measure new Top
			var newTop = $node.offset().top;

			//move node back
			$node
				.removeClass('animate')
				.css('top', oldTop - newTop);

			$inBetween
				.removeClass('animate')
				.css('top', oldTop < newTop ?  height : -1 * height);

			$node.offset();

			$node.addClass('animate').css('top', 0);
			$inBetween.addClass('animate').css('top', 0);
		}
	}
});
