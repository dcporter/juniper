
/*
  Statecharts are powerful SproutCore objects, implementing finite state machines, for maintaining
  your application's state in a structured, robust way.

  This application's statechart has the following (simplified) structure:

  |--authenticatingState - Checks for an okay user. Authentication isn't implemented, so this state
  |                        is super-thin. Transitions to authenticatedState basically no matter what.
  |
  |--authenticatedState - Yup user looks good.
      |
      |-- loadingState - The application's fixtures are loaded if needed, then its data is loaded.
      |                  Transitions to readyState.
      |
      |-- readyState - Once everything is loaded, the application switches into this state, which
           |           handles its regular running and user interactions, switching between several
           |           substates depending on what part of the application the user is in. The
           |           readyState substates also handle URL routing. Each substate contains the code
           |           required to set itself up and tear itself down, and only handles events and
           |           actions appropriate to that state, giving us very neat and well-organized
           |           application logic.
           |
           |-- launchState
           |-- notesListState - (including all notes, tagged notes, and archived notes)
           |-- noteState
           |-- typographyState
           |-- creditsState
*/
V.statechart = SC.Statechart.create({

  // This prevents routing from beginning until we're loaded.
  isReady: NO,
  statechartShouldStateHandleTriggeredRoute: function(statechart, state, context) {
    return this.get('isReady');
  },
  continueRouting: function() {
    SC.routes.notifyPropertyChange('location');
  },

  // This defaults to `rootState`, and you can just create your substates within `rootState` if you
  // like. I've chosen to bump everything up a level by cantankerously getting rid of it.
  initialState: 'authenticatingState',

  authenticatingState: SC.State.plugin('V.AuthenticatingState'),
  unauthenticatedState: SC.State.plugin('V.UnauthenticatedState'),
  authenticatedState: SC.State.plugin('V.AuthenticatedState')

});
