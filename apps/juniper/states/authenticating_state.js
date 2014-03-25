
V.AuthenticatingState = SC.State.extend({
	// Actions and events which this state handles.
	authenticationDidFail: function() {
		V.statechart.gotoState('unauthenticatedState');
	},
	authenticationDidSucceed: function() {
		V.statechart.gotoState('authenticatedState');
	},

	// internal support
	enterState: function() {
		V.mainPage.get('authenticatingPane').append();
		// Check for authentication.
		// Looks good!
		V.statechart.sendEvent('authenticationDidSucceed');
	},
	exitState: function() {
		V.mainPage.get('authenticatingPane').remove();
	}
});
