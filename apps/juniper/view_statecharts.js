// I've given these their own file to separate the substantial view-state code
// out from the view code itself.

// Mixed into the main pane's contentView. 
V.MainViewStatechart = SC.mixin({}, SC.StatechartManager, {
  statechartOwnerKey: 'statechartOwner',
  rootState: SC.State.extend({
    substatesAreConcurrent: YES,
    // This substate handles menu visibility.
    menuStates: SC.State.extend({
      initialSubstate: 'menuIsClosedState',
      // The menu is hidden and static. Any transitions are complete.
      menuIsClosedState: SC.State.extend({
        enterState: function() {
          var menuView = this.getPath('owner.menuView'),
              appView = this.getPath('owner.appView');
          // Convert layouts to flexible.
          menuView.adjust({
            left: V.mainPage.MENU_CLOSED_OFFSET,
            top: 0,
            bottom: 0,
            height: null
          });
          appView.adjust({
            width: null,
            height: null,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          });
          // Set the global controller. (TODO: think more about whether this is the right spot for this.)
          V.mainViewController.set('menuIsOpen', NO);
        },
        doToggleMenu: function() {
          this.doOpenMenu();
        },
        doOpenMenu: function() {
          this.gotoState('menuIsTogglingOpenState');
        }
      }),
      // The menu is animating open.
      menuIsTogglingOpenState: SC.State.extend({
        enterState: function() {
          var menuView = this.getPath('owner.menuView'),
              appView = this.getPath('owner.appView');
          // Convert layouts to fixed & animatable.
          menuView.adjust({
            left: V.mainPage.MENU_CLOSED_OFFSET,
            top: 0,
            height: menuView.getPath('frame.height'),
            bottom: null
          });
          appView.adjust({
            left: 0,
            width: appView.getPath('frame.width'),
            top: 0,
            height: appView.getPath('frame.height'),
            right: null,
            bottom: null
          });
          // Animate the views!
          menuView.animate('left', 0, V.mainPage.MENU_TRANSITION_OPEN_DURATION, this, this._menuAnimationDidFinish);
          appView.animate('left', V.mainPage.APP_PANE_OPEN_OFFSET, V.mainPage.MENU_TRANSITION_OPEN_DURATION, this, this._appPaneAnimationDidFinish);
        },
        // If we don't explicitly wait on both, CSS transitions may still be active on views.
        _menuAnimationDidFinish: function() {
          this._menuAnimationIsFinished = YES;
          if (this._menuAnimationIsFinished && this._appPaneAnimationIsFinished) this.gotoState('menuIsOpenState');
        },
        _appPaneAnimationDidFinish: function() {
          this._appPaneAnimationIsFinished = YES;
          if (this._menuAnimationIsFinished && this._appPaneAnimationIsFinished) this.gotoState('menuIsOpenState');
        },
        exitState: function() {
          this._menuAnimationIsFinished = NO;
          this._appPaneAnimationIsFinished = NO;
        }
      }),
      // The menu is visible and static. Any transitions are complete.
      menuIsOpenState: SC.State.extend({
        enterState: function() {
          var menuView = this.getPath('owner.menuView'),
              appView = this.getPath('owner.appView');
          // Convert layouts to flexible.
          menuView.adjust({
            left: 0,
            top: 0,
            bottom: 0,
            height: null
          });
          appView.adjust({
            left: V.mainPage.APP_PANE_OPEN_OFFSET,
            right: -V.mainPage.APP_PANE_OPEN_OFFSET,
            top: 0,
            bottom: 0,
            width: null,
            height: null
          });
          // Set the global controller. (TODO: think more about whether this is the right spot for this.)
          V.mainViewController.set('menuIsOpen', YES);
        },
        doToggleMenu: function() {
          this.doCloseMenu();
        },
        doCloseMenu: function() {
          this.gotoState('menuIsTogglingClosedState');
        }
      }),
      // The menu is animating shut.
      menuIsTogglingClosedState: SC.State.extend({
        enterState: function() {
          var menuView = this.getPath('owner.menuView'),
              appView = this.getPath('owner.appView');
          // Convert layouts to absolute & animatable.
          menuView.adjust({
            left: 0,
            top: 0,
            height: menuView.getPath('frame.height'),
            bottom: null
          });
          appView.adjust({
            left: V.mainPage.APP_PANE_OPEN_OFFSET,
            width: appView.getPath('frame.width'),
            top: 0,
            height: appView.getPath('frame.height'),
            right: null,
            bottom: null
          });
          // Animate the views!
          menuView.animate('left', V.mainPage.MENU_CLOSED_OFFSET, V.mainPage.MENU_TRANSITION_CLOSED_DURATION, this, this._menuAnimationDidFinish);
          appView.animate('left', 0, V.mainPage.MENU_TRANSITION_CLOSED_DURATION, this, this._appPaneAnimationDidFinish);
        },
        // If we don't explicitly wait on both, CSS transitions may still be active on views.
        _menuAnimationDidFinish: function() {
          this._menuAnimationIsFinished = YES;
          if (this._menuAnimationIsFinished && this._appPaneAnimationIsFinished) this.gotoState('menuIsClosedState');
        },
        _appPaneAnimationDidFinish: function() {
          this._appPaneAnimationIsFinished = YES;
          if (this._menuAnimationIsFinished && this._appPaneAnimationIsFinished) this.gotoState('menuIsClosedState');
        }
      }),
      // The user is actively dragging the menu around
      userIsDraggingPaneState: SC.State.extend({

      })
    }),
    // This substate handles current app state.
    appStates: SC.State.extend({
      // Actions. If an action reaches this level then just go to the static state. (Transitions
      // are handled by actions within each static state. For example, to go from top to bottom)
      doViewNotesList: function() {
        this.gotoState('notesListState');
      },
      doViewNote: function(context) {
        this.gotoState('noteState', context);
      },
      doViewTypography: function() {
        this.gotoState('typographyState');
      },
      doViewCredits: function() {
        this.gotoState('creditsState');
      },

      initialSubstate: 'launchState',
      launchState: SC.State,
      // Static states
      notesListState: SC.State.extend({
        enterState: function() {
          // Set the title bar's static state...
          this.getPath('owner.titleViewOutlet').set('isVisible', YES).adjust({ opacity: 1 });
          this.setPath('owner.backButtonTextViewOutlet.isVisible', NO);
          this.getPath('owner.buttonsViewOutlet').sendAction('doGoToListState');
          // ...and the content views'...
          this.setPath('owner.spareBreviaryViewOutlet.isVisible', NO);
          this.getPath('owner.notesListViewOutlet').adjust({ opacity: null, scale: null });
          this.setPath('owner.noteViewOutlet.isVisible', NO);
          this.setPath('owner.noteLifecycleToolbarViewOutlet.isVisible', NO);
          // ...reset any list item view's opacity...
          var content = V.noteViewController.get('content');
          if (content) {
            var itemView = this.getPath('owner.notesListViewOutlet.contentView').itemViewForContentObject(content);
            if (itemView) itemView.adjust('opacity', null);            
          }
          // ...and alert the people that we have fully left the note state.
          V.statechart.sendEvent('noteIsNoLongerVisible');
          // Also, let's reset the note's scroller view here.
          this.getPath('owner.noteViewOutlet').scrollView.set('verticalScrollOffset', 0);
        },
        doViewNote: function(context) {
          this.gotoState('noteListToNoteWithoutImageState', context);
        }
      }),
      noteState: SC.State.extend({
        enterState: function(context) {
          // Set note view to flexible layout.
          this.getPath('owner.noteViewOutlet').adjust({
            opacity: null,
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            height: null,
            width: null
          }).set('isVisible', YES);
          this.getPath('owner.noteLifecycleToolbarViewOutlet').set('isVisible', YES);
          this.getPath('owner.backButtonTextViewOutlet').adjust({ opacity: null });
          // Header
          this.setPath('owner.titleViewOutlet.isVisible', NO);
          // Buttons
          this.getPath('owner.buttonsViewOutlet').sendAction('doGoToNoteState');
          // If the note is blank, it's new; focus the editor.
          if (!V.noteViewController.get('text')) {
            this.getPath('owner.noteViewOutlet.editorViewOutlet').becomeFirstResponder();
          }
          // If there's a previous note specified in the context, we have to unhide its list item view.
          if (context && context.previousNote) {
            var previousListItem = this.getPath('owner.notesListViewOutlet.contentView').itemViewForContentObject(context.previousNote);
            if (previousListItem) previousListItem.adjust('opacity', 1);
          }
        },
        exitState: function() {
          this.getPath('owner.noteViewOutlet.editorViewOutlet').resignFirstResponder();
        },
        doViewNotesList: function() {
          var content = V.noteViewController.get('content');
          this.doReturnToList({ content: content });
        },
        doReturnToList: function(context) {
          this.doHideToolbars();
          this.gotoState('noteToNoteListByButtonState', context);
        },
        // TODO: return by slide.

        doToggleShareToolbar: function() {
          var owner = this.get('owner'),
              shareToolbar = owner.get('shareToolbarViewOutlet'),
              overlay = owner.get('toolbarOpenOverlayViewOutlet');
          
          if (shareToolbar.get('isVisible')) return this.doHideToolbars();
          
          shareToolbar.set('isVisible', YES);
          overlay.set('isVisible', YES);
        },

        doHideToolbars: function() {
          var owner = this.get('owner'),
              shareToolbar = owner.get('shareToolbarViewOutlet'),
              overlay = owner.get('toolbarOpenOverlayViewOutlet');
          shareToolbar.set('isVisible', NO);
          overlay.set('isVisible', NO);
        }
      }),
      typographyState: SC.State.extend({
        enterState: function() {
          var buttonsView = this.getPath('owner.buttonsViewOutlet');
          buttonsView.gotoState('typographyOrCreditsState');
          this.setPath('owner.typographyViewOutlet.isVisible', YES);
        },
        exitState: function() {
          this.setPath('owner.typographyViewOutlet.isVisible', NO);
        }
      }),
      creditsState: SC.State.extend({
        enterState: function() {
          var buttonsView = this.getPath('owner.buttonsViewOutlet');
          buttonsView.gotoState('typographyOrCreditsState');
          this.setPath('owner.creditsViewOutlet.isVisible', YES);
        },
        exitState: function() {
          this.setPath('owner.creditsViewOutlet.isVisible', NO);
        },
        // Intercept this action.
        doViewCredits: function() {}
      }),

      // Transition states

      // Note list -> note states
      noteListToNoteWithoutImageState: SC.State.extend({
        enterState: function(context) {
          // Header view stuff.
          var backButtonTextView = this.getPath('owner.backButtonTextViewOutlet'),
              titleView = this.getPath('owner.titleViewOutlet'),
              buttonsView = this.getPath('owner.buttonsViewOutlet');
          titleView.animate({ opacity: 0 }, V.mainPage.STATE_TRANSITION_DURATION, this, this._titleAnimationDidFinish);
          backButtonTextView.adjust({ opacity: 0 }).set('isVisible', YES).animate({
            opacity: 1
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._backButtonTextAnimationDidFinish);
          buttonsView.sendAction('doGoToNoteState');

          // Content view stuff.
          var notesListView = this.getPath('owner.notesListViewOutlet'),
              breviaryView = this.getPath('owner.spareBreviaryViewOutlet'),
              noteView = this.getPath('owner.noteViewOutlet'),
              toolbarView = this.getPath('owner.noteLifecycleToolbarViewOutlet'),
              wrapperView = this.getPath('owner.notesParentViewOutlet');

          // Get the animation value and set up the spare breviary view's animation. Or, if
          // we don't have a content item or an item view, don't.
          var fromTopValue;
          if (context.content) {
            var content = context.content,
                listItem = notesListView.contentView.itemViewForContentObject(content);
            
            if (listItem) {
              // Convert the item view's frame to the wrapper view's coordinates.
              var itemFrame = listItem.get('frame'),
                  matchedFrame = listItem.parentView.convertFrameToView(itemFrame, wrapperView);

              fromTopValue = matchedFrame.y;

              // Set up the breviary view over top of the context's item view. Set the note
              // view up at the same spot.
              breviaryView.set('content', content);
              breviaryView.adjust({
                opacity: 1,
                left: matchedFrame.x,
                top: fromTopValue,
                height: matchedFrame.height,
                width: matchedFrame.width
              }).set('isVisible', YES);

              // Hide the list item view.
              listItem.adjust('opacity', 0);
            }
          }
          // If we didn't manage to get a fromTopValue, make it 0, and pretend the breviary view did its thing.
          if (SC.none(fromTopValue)) {
            fromTopValue = 0;
            this._breviaryAnimationIsFinished = YES;
          }

          noteView.adjust({
            opacity: 0,
            left: 0,
            top: fromTopValue,
            width: noteView.getPath('frame.width'),
            height: wrapperView.getPath('frame.height'),
            right: null,
            bottom: null
          }).set('isVisible', YES);

          // Shrink and fade the notesListView.
          notesListView.animate({
            opacity: 0,
            scale: 0.9
          }, V.mainPage.STATE_TRANSITION_DURATION);

          // Move the breviary view to the top and fade out.
          breviaryView.animate({
            top: 0,
            opacity: 0
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._noteAnimationDidFinish);

          // Move the note view to the top and fade in.
          noteView.animate({
            top: 0,
            opacity: 1
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._breviaryAnimationDidFinish);

          // Fade the toolbar in.
          toolbarView.adjust({ opacity: 0 })
            .set('isVisible', YES)
            .animate({ opacity: 1 }, V.mainPage.STATE_TRANSITION_DURATION);
        },
        _backButtonTextAnimationDidFinish: function() {
          if (!this.get('isCurrentState')) return;
          this._backButtonTextAnimationIsFinished = YES;
          this._testFinished();
        },
        _titleAnimationDidFinish: function() {
          if (!this.get('isCurrentState')) return;
          this._titleAnimationIsFinished = YES;
          this._testFinished();
        },
        _noteAnimationDidFinish: function() {
          if (!this.get('isCurrentState')) return;
          this._noteAnimationIsFinished = YES;
          this._testFinished();
        },
        _breviaryAnimationDidFinish: function() {
          if (!this.get('isCurrentState')) return;
          this._breviaryAnimationIsFinished = YES;
          this._testFinished();
        },
        _testFinished: function() {
          if (
            this._titleAnimationIsFinished && this._backButtonTextAnimationIsFinished &&
            this._noteAnimationIsFinished && this._breviaryAnimationIsFinished
          ) {
            this.invokeOnce(this.animationsDidFinish);
          }
        },
        animationsDidFinish: function() {
          if (!this.get('isCurrentState')) return;
          this.gotoState('noteState');
        },
        exitState: function() {
          // Reset internal flags.
          this._titleAnimationIsFinished = NO;
          this._backButtonTextAnimationIsFinished = NO;
          this._noteAnimationIsFinished = NO;
          this._breviaryAnimationIsFinished = NO;
        }
      }),
      noteListToNoteWithImageState: SC.State.extend({
        // TODO
        enterState: function() {
          this.gotoState('noteState');
        }
      }),
      // Note -> note list states
      noteToNoteListByButtonState: SC.State.extend({
        // Actions.
        // We need to intercept this action since we're transitioning there already and don't want
        // the parent state to handle it.
        doViewNotesList: function() {},
        // Internal support.
        enterState: function(context) {
          // Header view stuff.
          var backButtonTextView = this.getPath('owner.backButtonTextViewOutlet'),
              titleView = this.getPath('owner.titleViewOutlet'),
              buttonsView = this.getPath('owner.buttonsViewOutlet');
          backButtonTextView.animate({ opacity: 0 }, V.mainPage.STATE_TRANSITION_DURATION, this, this._backButtonTextAnimationDidFinish);
          titleView.adjust({ opacity: 0 }).set('isVisible', YES).animate({
            opacity: 1
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._titleAnimationDidFinish);
          buttonsView.sendAction('doGoToListState');

          // Content view stuff.
          var notesListView = this.getPath('owner.notesListViewOutlet'),
              breviaryView = this.getPath('owner.spareBreviaryViewOutlet'),
              noteView = this.getPath('owner.noteViewOutlet'),
              toolbarView = this.getPath('owner.noteLifecycleToolbarViewOutlet'),
              wrapperView = this.getPath('owner.notesParentViewOutlet');

          // Find the top value to which we're animating. 
          var toTopValue;
          // If we have context and a content and an item view, we're animating back to the
          // note list's copy of this note.
          if (context && context.content) {
            var content = context.content;
            // Special case: if the note is now archived and the list isn't. (The note's item view may
            // still exist even though it will be removed before it's made visible.)
            if (content.get('archived') && !V.mainViewController.get('isInArchive')) {
              // Pass.
            }
            // Otherwise, convert the item view's frame to the wrapper view's coordinates.
            else {
              var listItem = notesListView.contentView.itemViewForContentObject(content);
              if (listItem) {
                listItem.adjust('opacity', 0);
                var itemFrame = listItem.get('frame'),
                    matchedFrame = listItem.parentView.convertFrameToView(itemFrame, wrapperView);
                toTopValue = matchedFrame.y;

                // Set up and animate breviary view back down to where the list item view is.
                breviaryView.set('content', content);
                breviaryView.adjust({ top: 0, left: matchedFrame.x, width: matchedFrame.width, height: matchedFrame.height, opacity: 0 });
                breviaryView.set('isVisible', YES);
                breviaryView.animate({
                  opacity: 1,
                  top: toTopValue
                }, V.mainPage.STATE_TRANSITION_DURATION, this, this._breviaryAnimationDidFinish);
              }
            }
          }
          // Otherwise, we're simply fading out in place, and the breviary view isn't involved.
          if (SC.none(toTopValue)) {
            toTopValue = 0;
            this._breviaryAnimationIsFinished = YES;
          }

          // Grow & fade the notes view back in.
          notesListView.adjust({
            opacity: 0,
            scale: 0.9
          });
          notesListView.animate({
            scale: 1,
            opacity: 1
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._noteListAnimationDidFinish);

          // Convert the note view to a static layout and animate it down and away.
          var noteViewFrame = noteView.get('frame');
          noteView.adjust({
            height: noteViewFrame.height,
            width: noteViewFrame.width,
            right: null,
            bottom: null
          }).animate({
            top: toTopValue,
            opacity: 0
          }, V.mainPage.STATE_TRANSITION_DURATION, this, this._noteAnimationDidFinish);

          // Fade the toolbar in.
          toolbarView.adjust({ opacity: 1 })
            .animate({ opacity: 0 }, V.mainPage.STATE_TRANSITION_DURATION, this, this._toolbarAnimationDidFinish);
        },
        // TODO: yeah some basic control flow abstraction would be awesome
        _backButtonTextAnimationDidFinish: function() {
          this._backButtonTextAnimationIsFinished = YES;
          this._testFinished();
        },
        _titleAnimationDidFinish: function() {
          this._titleAnimationIsFinished = YES;
          this._testFinished();
        },
        _breviaryAnimationDidFinish: function() {
          this._breviaryAnimationIsFinished = YES;
          this._testFinished();
        },
        _noteAnimationDidFinish: function() {
          this._noteAnimationIsFinished = YES;
          this._testFinished();
        },
        _toolbarAnimationDidFinish: function() {
          this._toolbarAnimationIsFinished = YES;
          this._testFinished();
        },
        _noteListAnimationDidFinish: function() {
          this._noteListAnimationIsFinished = YES;
          this._testFinished();
        },
        _testFinished: function() {
          // Test all animations.
          var isFinished = this._titleAnimationIsFinished && this._backButtonTextAnimationIsFinished;
          isFinished = isFinished && this._breviaryAnimationIsFinished && this._noteAnimationIsFinished;
          isFinished = isFinished && this._toolbarAnimationIsFinished && this._noteListAnimationIsFinished;
          if (isFinished) {
            // invokeOnce lets animation callbacks complete and prevent multiple calls.
            this.invokeOnce(this.animationsDidFinish);
          }
        },
        animationsDidFinish: function() {
          this.gotoState('notesListState');
        },
        exitState: function() {
          this._titleAnimationIsFinished = NO;
          this._backButtonTextAnimationIsFinished = NO;
          this._breviaryAnimationIsFinished = NO;
          this._noteAnimationIsFinished = NO;
          this._toolbarAnimationIsFinished = NO;
          this._noteListAnimationIsFinished = NO;
        }
      }),
      // Keeping this its own state in case we need to get fancy later, but for now this is 99.9%
      // overlapped with noteToNoteListByButtonState, so we'll just proxy to there.
      noteToNoteListByArchiveOrDeleteState: SC.State.extend({
        // Actions
        // We need to block this action since we're transitioning there already and don't want
        // the parent state to handle it.
        doViewNotesList: function() {},
        // Internal support
        enterState: function() {
          this.gotoState('noteToNoteListByButtonState');
        }
      }),
      // TODO
      noteToNoteListBySlidingState: SC.State.extend({
        // Actions
        // We need to block this action since we're transitioning there already and don't want
        // the parent state to handle it.
        doViewNotesList: function() {},
        // Internal Support
        enterState: function() {
          this.gotoState('notesListState');
        }
      })
    })
  })
});

// Mixed into the notes list view.
V.NotesListViewStatechart = SC.mixin({}, SC.StatechartManager, {
  statechartOwnerKey: 'statechartOwner',
  rootState: SC.State.extend({
    initialSubstate: 'readyState',

    readyState: SC.State.extend({
      mouseDown: function(evt) {
        // GATEKEEP: Left button only.
        if (evt.button > 0) return NO;
        if (evt.which > 1) return NO; // old IE
        // Carry on
        var owner = this.get('owner'),
            itemView = owner.itemViewForEvent(evt);
        if (!itemView) return NO;
        var context = {
          itemView: itemView,
          eventOrigin: { pageX: evt.pageX, pageY: evt.pageY },
          beginDragOnTimer: NO
        }
        this.gotoState('selectingItemState', context);
        return YES;
      },
      touchStart: function(evt) {
        var owner = this.get('owner'),
            itemView = owner.itemViewForEvent(evt);
        if (!itemView) return NO;
        var context = {
          itemView: itemView,
          eventOrigin: { pageX: evt.pageX, pageY: evt.pageY },
          beginDragOnTimer: YES
        }
        this.gotoState('selectingItemState', context);
        return YES;
      }
    }),

    // When an interaction begins, we're selecting.
    selectingItemState: SC.State.extend({
      // ASSUMPTIONS: State's entry context is has an itemView, an eventOrigin, and an optional
      // beginDragOnTimer flag.
      enterState: function(context) {
        // Activate the passed item view.
        var selectedItemView = context.itemView;
        selectedItemView.set('isActive', YES);
        // Set internal timer if needed (i.e. if touch).
        if (context.beginDragOnTimer) {
          this._eventOrigin = context.eventOrigin;
          this._timer = SC.Timer.schedule({
            target: this,
            action: 'didLinger',
            interval: 300
          });
        }
        // Note down the important information.
        this._activeView = selectedItemView;
        this._eventOrigin = context.eventOrigin;
      },

      didLinger: function() {
        this.doBeginDrag(this._eventOrigin);
      },
      doBeginDrag: function(evt) {
        var context = {
          itemView: this._activeView,
          // We reset the event origin so there are no ugly jumps.
          eventOrigin: {
            pageX: evt.pageX,
            pageY: evt.pageY
          }
        }
        this.gotoState('movingItemState', context);
      },

      // Sometimes we can get stuck in this state if the original click gets interrupted and
      // new start-events aren't handled.
      mouseDown: function(evt) { return YES; },
      touchStart: function(evt) { return YES; },

      // A mouse drag may send us into movingItemState, slidingItemOpenState, or pass control
      // to the pane for menu-exposing.
      mouseDragged: function(evt) {
        var deltaX = evt.pageX - this._eventOrigin.pageX,
            deltaY = evt.pageY - this._eventOrigin.pageY;
        // If we've moved up or down by three pixels, initiate a drag.
        if (Math.abs(deltaY) >= 3) {
          this.doBeginDrag(evt);
        }
        // TODO: If we've moved left by five pixels, slide open the item menu.
        else if (deltaX <= -5) {
          //this.gotoState('slidingItemOpenState', {/*TODO*/});
        }
        // TODO: If we've moved right by five pixels, pass this along to the pane to expose the menu.
        else if (deltaX >= 5) {
          //this.gotoState('readyState');
        }
        return YES;
      },

      // If the touch drags in any direction before the didLinger timer goes off, go to the appropriate state.
      touchesDragged: function(evt, touches) {
        var deltaX = evt.pageX - this._eventOrigin.pageX,
            deltaY = evt.pageY - this._eventOrigin.pageY;
        // If we've moved up or down, start scrolling and go back to readyState.
        if (Math.abs(deltaY) > 4) {
          touches.invoke('restoreLastTouchResponder');
          this.gotoState('readyState');
        }
        // If we've moved left by five pixels, slide open the item menu.
        else if (deltaX <= -5) {
          //this.gotoState('slidingItemOpenState', {/*TODO*/});
        }
        // TODO: If we've moved right by five pixels, pass this along to the pane to expose the menu.
        else if (deltaX >= 5) {
          //this.gotoState('readyState');
        }
        return YES;
      },

      // If we're still in this state when mouseUp triggers, the item has been selected!
      mouseUp: function(evt) {
        V.statechart.sendAction('doViewNote', this._activeView);
        // TODO: send an action to the pane's statechart to do the view transition.
        this.gotoState('readyState');
      },
      touchEnd: function(evt) {
        V.statechart.sendAction('doViewNote', this._activeView);
        // TODO: send an action to the pane's statechart to do the view transition.
        this.gotoState('readyState');
      },

      exitState: function() {
        // Deactivate the item view.
        this._activeView.set('isActive', NO);
        this._activeView = null;
        this._eventOrigin = null;
        if (this._timer) {
          this._timer.invalidate();
          this._timer = null;
        }
      }
    }),
    // Initiate a drag and handle its events.
    movingItemState: SC.State.extend({
      enterState: function(context) {
        // Get the breviary note view and populate it.
        var itemView = context.itemView,
            content = itemView.get('content'),
            breviaryView = this.getPath('owner.spareBreviaryViewOutlet'),
            listView = this.get('owner'),
            wrapperView = listView.get('wrapperViewOutlet');
        breviaryView.set('content', content);
        breviaryView.set('eventDelegate', this.get('owner'));
        breviaryView.set('isDragging', YES);
        // Position it directly over the item view.
        var itemFrame = itemView.get('frame'),
            matchedFrame = itemView.parentView.convertFrameToView(itemFrame, wrapperView);
        breviaryView.adjust({
          top: matchedFrame.y,
          left: matchedFrame.x,
          height: matchedFrame.height,
          width: matchedFrame.width,
          opacity: null
        });
        breviaryView.set('isVisible', YES);
        // Signal that the item view should be transparent.
        content.set('isReindexing', YES);
        // Cache.
        this._activeContent = content;
        this._eventOrigin = context.eventOrigin;
        this._breviaryView = breviaryView;
        this._breviaryViewOriginY = matchedFrame.y;
        this._currentY = context.eventOrigin.pageY;
        this._currentlyOverIndex = itemView.get('contentIndex');
      },

      // Semantic events
      itemViewDidDrag: function(context) {
        // Reposition the breviary view.
        var breviaryView = this._breviaryView,
            listView = this.get('owner'),
            wrapperView = this.getPath('owner.wrapperViewOutlet'),
            scrollView = this.getPath('owner.parentView.parentView'),
            pageY = context ? context.pageY : this._currentY,
            prevPageY = this._currentY,
            wrapperHeight = wrapperView.getPath('frame.height'),
            breviaryHeight = breviaryView.getPath('frame.height'),
            breviarySemiheight = breviaryHeight / 2,
            wrapperY = wrapperView.convertFrameFromView({ x: 0, y: pageY, height: 0, width: 0 }).y,
            deltaY = pageY - this._eventOrigin.pageY,
            breviaryY = this._breviaryViewOriginY + deltaY;

        this._currentY = pageY;

        // First, we constrain the breviary's position to within the wrapper view.
        // TODO: tweak this.
        if (breviaryY < -breviarySemiheight) breviaryY = -breviarySemiheight;
        if (breviaryY + breviaryHeight > wrapperHeight + breviarySemiheight) breviaryY = wrapperHeight - breviaryHeight + breviarySemiheight;

        // If we're near the top or bottom, scroll the scroll view.
        var scrollFactorTop = breviaryY,
            scrollFactorBottom = wrapperHeight - breviaryY - breviaryHeight;
        if (scrollFactorTop < listView.DRAG_SCROLL_MARGIN) {
          this.get('statechart').sendAction('doScrollNoteListUp', { scrollFactor: listView.DRAG_SCROLL_MARGIN - scrollFactorTop });
        } else if (scrollFactorBottom < listView.DRAG_SCROLL_MARGIN) {
          this.get('statechart').sendAction('doScrollNoteListDown', { scrollFactor: listView.DRAG_SCROLL_MARGIN - scrollFactorBottom });
        } else {
          this.get('statechart').sendAction('doStopScrollingNoteList');
        }

        breviaryView.adjust('top', parseInt(breviaryY, 10));

        // Translate the event's pageY into other contexts.
        var listY = listView.convertFrameFromView({ x: 0, y: pageY, height: 0, width: 0 }).y;

        var lastIdx = this._currentlyOverIndex;

        // Find the index at this height.
        // TODO: Optimize this.
        var len = listView.get('length'),
            i;
        for (i = 0; i < len; i++) {
          if (listY < listView.rowOffsetForContentIndex(i)) break;
        }
        // If we found an index, or we busted out the bottom, the index we're over (or past) is one before i.
        if (i > 0) i--;

        // Compare to the cached index and trigger a change notification if necessary.
        if (i !== lastIdx) {
          this._currentlyOverIndex = i;
          V.statechart.sendAction('doReindexContent', {
            content: this._activeContent,
            fromIndex: lastIdx,
            toIndex: i
          });
        }
      },
      dragDidEnd: function() {
        // Translate the item view's frame into the wrapper's context and animate
        var content = this._activeContent,
            breviaryView = this._breviaryView,
            listView = this.get('owner'),
            itemView = listView.itemViewForContentObject(this._activeContent),
            itemFrame = itemView.get('frame'),
            wrapperView = this.getPath('owner.wrapperViewOutlet'),
            matchedFrame = itemView.parentView.convertFrameToView(itemFrame, wrapperView);

        // Animate the breviary view back to where it goes.
        this._activeView = itemView;
        breviaryView.animate('top', matchedFrame.y, 0.4, this, this._breviaryAnimationDidFinish);

        // Alert the statechart.
        V.statechart.sendAction('doCommitContent', { content: content });
        this.gotoState('readyState');
      },
      // Note that this method runs after this state has exited.
      _breviaryAnimationDidFinish: function() {
        this._activeContent.set('isReindexing', NO);
        this._breviaryView.set('isVisible', NO);
        this._breviaryView.set('isDragging', NO);
        this._breviaryView.set('content', null);
        this._breviaryView.set('eventDelegate', null);
        this._activeContent = null;
        this._activeView = null;
        this._breviaryView = null;
      },

      // Raw events
      mouseDown: function(evt) { return YES; },
      touchStart: function(evt) { return YES; },

      mouseDragged: function(evt) {
        this.itemViewDidDrag(evt);
      },
      touchesDragged: function(evt) {
        this.itemViewDidDrag(evt);
      },

      mouseUp: function(evt) {
        this.dragDidEnd();
      },
      touchEnd: function(evt) {
        this.dragDidEnd();
      },

      // Scrolling
      doScrollNoteListUp: function(context) {
        this.gotoState('scrollingUpState', context);
      },
      doScrollNoteListDown: function(context) {
        this.gotoState('scrollingDownState', context);
      },
      doStopScrollingNoteList: function(context) {
        this.gotoState('notScrollingState', context);
      },
      _scrollForFactor: function(factor, lastFrame) {
        var minFactor = 0,
            maxFactor = this.get('owner').DRAG_SCROLL_MARGIN,
            factorRange = maxFactor - minFactor,
            minScroll = 0,
            maxScroll = 4,
            scrollRange = maxScroll - minScroll,
            scrollPerFrame =  (((factor - minFactor) * scrollRange) / factorRange) + minScroll,
            frames = (Date.now() - lastFrame) / 30,
            scrollBy = scrollPerFrame * frames;
        return scrollBy;
      },

      initialSubstate: 'notScrollingState',
      notScrollingState: SC.State,
      scrollingUpState: SC.State.extend({
        enterState: function(context) {
          // Calculate the current interval.
          this._factor = context.scrollFactor;
          this._last = Date.now();
          this._timer = SC.Timer.schedule({
            target: this,
            action: '_doScroll',
            interval: 30,
            repeats: YES
          });
        },
        doScrollNoteListUp: function(context) {
          this._factor = context.scrollFactor;
        },
        _doScroll: function() {
          var scrollBy = this.parentState._scrollForFactor(this._factor, this._last);
          this._last = Date.now();
          this.getPath('owner.parentView.parentView').scrollBy(0, -scrollBy);
          this.get('statechart').sendAction('itemViewDidDrag');
        },
        exitState: function(context) {
          this._timer.invalidate();
          this._timer = null;
        }
      }),
      scrollingDownState: SC.State.extend({
        enterState: function(context) {
          // Calculate the current interval.
          this._factor = context.scrollFactor;
          this._last = Date.now();
          this._timer = SC.Timer.schedule({
            target: this,
            action: '_doScroll',
            interval: 30,
            repeats: YES
          });
        },
        doScrollNoteListDown: function(context) {
          this._factor = context.scrollFactor;
        },
        _doScroll: function() {
          var scrollBy = this.parentState._scrollForFactor(this._factor, this._last);
          this._last = Date.now();
          this.getPath('owner.parentView.parentView').scrollBy(0, scrollBy);
          this.get('statechart').sendAction('itemViewDidDrag');
        },
        exitState: function(context) {
          this._timer.invalidate();
          this._timer = null;
        }
      }),

      exitState: function() {
        // _activeContent, _activeView and _breviaryView are wrapped up in _breviaryAnimationDidFinish.
        this._eventOrigin = null;
        this._breviaryViewOriginY = null;
        this._currentlyOverIndex = null;
      }
    }),
    // TODO: Open the item's underlying menu.
    slidingItemOpenState: SC.State.extend({
      enterState: function(context) {
        this.gotoState('readyState');
      }
    })
  })
});

// Mixed into the title bar's button view.
V.TitleButtonsStatechart = SC.mixin({}, SC.StatechartManager, {
  statechartOwnerKey: 'statechartOwner',

  buttonCount: 1,
  buttonCountDidChange: function() {
    var count = this.get('buttonCount'),
        width;
    switch (count) {
      case 0: width = this.SLOT_ONE_RIGHT; break;
      case 1: width = this.SLOT_ONE_RIGHT + this.BUTTON_WIDTH; break;
      case 2: width = this.SLOT_TWO_RIGHT + this.BUTTON_WIDTH; break;
      case 3: width = this.SLOT_THREE_RIGHT + this.BUTTON_WIDTH; break;
    }
    // The back button is on top of us, so we don't need to adjust our own width,
    // which is good because I don't feel like implementing callbacks to wait until
    // the buttons are all faded so things don't disappear by overflow.
    this.getPath('parentView.backButtonView').adjust({ right: width });
    this.getPath('parentView.backButtonTextView').adjust({ right: width });
  }.observes('buttonCount'),

  rootState: SC.State.extend({
    // Actions (TODO: more of these. Right now, this statechart is being manhandled directly
    // by the main view statechart.)
    doGoToListState: function() {
      if (V.mainViewController.get('isInArchive')) {
        this.gotoState('archivedListState');
      } else {
        this.gotoState('nonArchivedListState');
      }
    },
    doGoToNoteState: function() {
      if (V.mainViewController.get('isInArchive')) {
        this.gotoState('archivedNoteNoKeyboardState');
      } else {
        this.gotoState('nonArchivedNoteNoKeyboardState');
      }
    },

    // This is all the other stuff.
    initialSubstate: 'nonArchivedListState',
    nonArchivedListState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', YES);
        shareButtonView.set('isVisible', NO);
        closeKeyboardButtonView.set('isVisible', NO);
        owner.set('buttonCount', 1);
      },
      isInArchiveDidChange: function() {
        var isInArchive = V.mainViewController.get('isInArchive');
        if (isInArchive) {
          this.gotoState('archivedListState');
        }
      }.stateObserves('V.mainViewController.isInArchive')
    }),
    nonArchivedNoteNoKeyboardState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', YES);
        closeKeyboardButtonView.set('isVisible', NO);
        shareButtonView.adjust({ right: owner.SLOT_TWO_RIGHT }).set('isVisible', YES);
        owner.set('buttonCount', 2);
      }
    }),
    nonArchivedNoteKeyboardState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', NO);
        closeKeyboardButtonView.set('isVisible', YES);
        shareButtonView.adjust({ right: owner.SLOT_TWO_RIGHT }).set('isVisible', YES);
        owner.set('buttonCount', 2);
      }
    }),
    archivedListState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', NO);
        closeKeyboardButtonView.set('isVisible', NO);
        shareButtonView.set('isVisible', NO);
        owner.set('buttonCount', 0);
      },
      isInArchiveDidChange: function() {
        var isInArchive = V.mainViewController.get('isInArchive');
        if (!isInArchive) {
          this.gotoState('nonArchivedListState');
        }
      }.stateObserves('V.mainViewController.isInArchive')
    }),
    archivedNoteNoKeyboardState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', NO);
        closeKeyboardButtonView.set('isVisible', NO);
        shareButtonView.adjust({ right: owner.SLOT_ONE_RIGHT }).set('isVisible', YES);
        owner.set('buttonCount', 1);
      }
    }),
    typographyOrCreditsState: SC.State.extend({
      enterState: function() {
        var owner = this.get('owner'),
            addButtonView = owner.getPath('addButtonView'),
            shareButtonView = owner.getPath('shareButtonView'),
            closeKeyboardButtonView = owner.getPath('closeKeyboardButtonView');
        addButtonView.set('isVisible', NO);
        closeKeyboardButtonView.set('isVisible', NO);
        shareButtonView.set('isVisible', NO);
        owner.set('buttonCount', 0);
      }
    })
  })
});
