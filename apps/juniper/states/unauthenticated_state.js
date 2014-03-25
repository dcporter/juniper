// A very much stubbed-in "authentication failed" state.

V.UnauthenticatedState = SC.State.extend({

	// Internal support
	enterState: function() {
		V.mainPage.get('unauthenticatedPage').append();
	},
	exitState: function() {
		V.mainPage.get('unauthenticatedPage').remove();
	}

});
