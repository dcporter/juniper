

V.AuthenticatedState = SC.State.extend({

	initialSubstate: 'loadingState',

	loadingState: SC.State.plugin('V.LoadingState'),

	readyState: SC.State.plugin('V.ReadyState')

});
