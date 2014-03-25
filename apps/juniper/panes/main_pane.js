
// The main pane of the application. Most of the views you see in the app live here, with references to other view
// classes defined in the views folder.

sc_require('views/menu_item_view');
sc_require('views/credits_view');
sc_require('views/note_breviary_view');
sc_require('views/typography_view');
sc_require('views/notes_list_view');
sc_require('views/note_view');
sc_require('view_statecharts');

V.MainPane = SC.MainPane.extend({
  childViews: ['contentView'],
  contentView: SC.View.extend(V.MainViewStatechart, {
    // Outlets - Title bar
    backButtonTextViewOutlet: SC.outlet('appView.headerView.backButtonTextView'),
    titleViewOutlet: SC.outlet('appView.headerView.titleView'),
    buttonsViewOutlet: SC.outlet('appView.headerView.buttonsView'),
    // Outlets - Toolbars
    shareToolbarViewOutlet: SC.outlet('appView.contentView.shareToolbarView'),
    toolbarOpenOverlayViewOutlet: SC.outlet('appView.contentView.toolbarOpenOverlayView'),
    // Outlets - Content
    notesListViewOutlet: SC.outlet('appView.contentView.notesListView'),
    spareBreviaryViewOutlet: SC.outlet('appView.contentView.spareBreviaryView'),
    noteViewOutlet: SC.outlet('appView.contentView.noteView'),
    noteLifecycleToolbarViewOutlet: SC.outlet('appView.contentView.noteLifecycleToolbarView'),
    notesParentViewOutlet: SC.outlet('appView.contentView'),
    // Outlets - Other
    typographyViewOutlet: SC.outlet('appView.contentView.typographyView'),
    creditsViewOutlet: SC.outlet('appView.creditsView'),

    // Views
    childViews: ['menuView', 'appView'],
    menuView: SC.ScrollView.extend({
      wantsAcceleratedLayer: YES,

      layout: { width: 282 },
      verticalOverlay: YES,
      verticalScrollerView: SC.OverlayScrollerView,

      contentView: SC.View.extend({
        childViewLayout: SC.View.VERTICAL_STACK,
        childViews: ['allNotesView', 'tagsView', 'archiveView', 'breakView', 'typographyView', 'creditsView'],
        // Triggers an update.
        selectedMenuItemDidChange: function() {
          this.get('childViews').forEach(function(view) {
            if (view !== this.tagsView) view.notifyPropertyChange('isSelectedMenuItem');
          }, this);
        }.observes('V.mainViewController.selectedMenuItem'),
        allNotesView: V.MenuItemView.extend({
          layout: { height: 40 },
          action: 'doViewAllNotes',
          name: 'V.AllNotes',
          icon: 'all-notes',
          value: V.SELECTED_MENU_ITEM.ALL_NOTES
        }),
        tagsView: SC.ListView.extend({
          layout: { height: 0 },
          classNames: ['juniper-menu-tags-list'],
          contentBinding: SC.Binding.oneWay('V.activeTagsController.arrangedObjects'),
          isSelectable: NO,
          rowHeight: 40,

          // which tag is selected impacts which tag view is selected.
          activeTagDidChange: function() {
            this.get('nowShowing').forEach(function(index) {
              this.itemViewForContentIndex(index).notifyPropertyChange('isSelectedMenuItem');
            }, this);
          }.observes('V.mainViewController.tag'),

          exampleView: V.MenuItemView.extend({
            action: 'doViewNotesWithTag',
            nameBinding: SC.Binding.oneWay('*content.name'),
            icon: 'tag',
            // If the selected tag is our tag, we're selected!
            isSelectedMenuItem: function() {
              var content = this.get('content');
              return content && content === V.mainViewController.get('tag');
            }.property('content').cacheable() // manually invalidated by parent view when tag changes.
          })
        }),
        archiveView: V.MenuItemView.extend({
          layout: { height: 40 },
          action: 'doViewArchive',
          classNames: ['juniper-menu-archive-item'],
          isVisibleBinding: SC.Binding.oneWay('V.archivedNotesController.length').bool(),
          name: 'V.Archive',
          icon: 'archive',
          value: V.SELECTED_MENU_ITEM.ARCHIVE
        }),
        breakView: SC.View.extend({ layout: { height: 20 } }),
        typographyView: V.MenuItemView.extend({
          layout: { height: 40 },
          action: 'doViewTypography',
          name: 'V.Typography',
          icon: 'typography',
          value: V.SELECTED_MENU_ITEM.TYPOGRAPHY
        }),
        creditsView: V.MenuItemView.extend({
          layout: { height: 40 },
          action: 'doViewCredits',
          name: 'V.Credits',
          icon: 'credits',
          value: V.SELECTED_MENU_ITEM.CREDITS
        }),
      })
    }),
    appView: SC.View.extend({
      wantsAcceleratedLayer: YES,
      classNames: ['juniper-app-pane'],
      childViews: ['contentView', 'headerView', 'creditsView'],

      headerView: SC.View.extend({
        layout: { height: 44 },
        classNames: ['juniper-header-bar'],
        childViews: ['titleView', 'backButtonTextView', 'buttonsView', 'backButtonView'],
        backButtonView: SC.ButtonView.extend({
          layout: { right: 44 },
          classNames: ['juniper-header-button', 'juniper-back-button'],
          action: 'doGoBack'
        }),
        backButtonTextView: SC.LabelView.extend({
          layout: { left: 30, right: 45, opacity: 0 },
          classNames: ['juniper-small-title'],
          isActiveBinding: SC.Binding.oneWay('.parentView.backButtonView.isActive'),
          classNameBindings: ['isActive:active'],
          localizeBinding: SC.Binding.oneWay('V.mainViewController.localizeTitle'),
          valueBinding: SC.Binding.oneWay('V.mainViewController.title')
        }),
        titleView: SC.LabelView.extend({
          layout: { left: 45, right: 45 },
          classNames: ['juniper-title'],
          localizeBinding: SC.Binding.oneWay('V.mainViewController.localizeTitle'),
          valueBinding: SC.Binding.oneWay('V.mainViewController.title').transform(function(title) { return title === 'V.Credits' ? '' : title }) // quick hack to prevent "Credits" from showing during fade-in.
        }),
        buttonsView: SC.View.extend(V.TitleButtonsStatechart, {
          layout: { width: 164, right: 0 },
          childViews: ['addButtonView', 'shareButtonView', 'closeKeyboardButtonView'],
          addButtonView: SC.ButtonView.extend(V.FadeTransitionSlow, {
            layout: { right: 0, width: 44 },
            classNames: ['juniper-button', 'juniper-header-button', 'juniper-add-button'],
            action: 'doCreateNewNote'
          }),
          shareButtonView: SC.ButtonView.extend(V.FadeTransitionSlow, {
            layout: { width: 44 },
            isVisible: NO,
            classNames: ['juniper-button', 'juniper-header-button', 'juniper-share-button'],
            action: 'doToggleShareToolbar'
          }),
          closeKeyboardButtonView: SC.ButtonView.extend(V.FadeTransitionSlow, {
            layout: { width: 44, right: 0 },
            isVisible: NO,
            classNames: ['juniper-button', 'juniper-header-button', 'juniper-keyboard-button'],
            action: 'doHideKeyboard'
          }),
          // Right layout constants for the buttons.
          SLOT_ONE_RIGHT: 0,
          SLOT_TWO_RIGHT: 60,
          SLOT_THREE_RIGHT: 120,
          BUTTON_WIDTH: 44
        })
      }),

      contentView: SC.View.extend({
        layout: { top: 44 },
        classNames: ['juniper-content-area'],
        childViews: ['notesListView', 'emptyListView', 'spareBreviaryView', 'noteView', 'noteLifecycleToolbarView', 'typographyView', 'toolbarOpenOverlayView', 'shareToolbarView', 'menuOpenOverlayView'],

        notesListView: V.NotesListView,

        emptyListView: SC.View.extend({
          isVisibleBinding: SC.Binding.oneWay('V.notesListViewController.length').not(),
          childViews: ['iconView', 'labelView'],
          iconView: SC.View.extend({
            layout: { height: 90, width: 90, centerX: 0, centerY: -71 }, /* WHY WISKUS WHY 71 */
            classNames: ['juniper-logo-ghost']
          }),
          labelView: SC.LabelView.extend({
            layout: { height: 20, centerY: -5 },
            classNames: ['juniper-no-notes-label'],
            localize: YES,
            value: 'V.NoNotes'
          })
        }),

        spareBreviaryView: V.NoteBreviaryView.extend({
          wantsAcceleratedLayer: YES,
          layout: { top: 0, height: 84 },
          classNames: ['spare-breviary-view'],
          isVisible: NO,
          isDragging: NO,
          classNameBindings: ['isDragging'],
          // Event proxying. Used during drag.
          eventDelegate: null,
          mouseDown: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('mouseDown')) return del.mouseDown(evt);
            else return NO;
          },
          mouseDragged: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('mouseDragged')) return del.mouseDragged(evt);
            else return NO;
          },
          mouseUp: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('mouseUp')) return del.mouseUp(evt);
            else return NO;
          },
          touchStart: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('touchStart')) return del.touchStart(evt);
            else return NO;
          },
          touchesDragged: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('touchesDragged')) return del.touchesDragged(evt);
            else return NO;
          },
          touchEnd: function(evt) {
            var del = this.get('eventDelegate');
            if (del && del.respondsTo('touchEnd')) return del.touchEnd(evt);
            else return NO;
          },
        }),

        noteView: V.NoteView.extend({
          isVisible: NO
        }),

        noteLifecycleToolbarView: SC.View.extend({
          layout: { height: 44, bottom: 0 },
          classNames: ['note-lifecycle-toolbar'],
          isVisible: NO,
          childViews: ['deleteButtonView', 'archiveButtonView', 'dearchiveButtonView'],
          deleteButtonView: SC.ButtonView.extend({
            layout: { height: 44, width: 44 },
            classNames: ['juniper-button', 'juniper-delete-button'],
            action: 'doPromptDeleteNote'
          }),
          archiveButtonView: SC.ButtonView.extend({
            layout: { height: 44, width: 44, right: 0 },
            isVisibleBinding: SC.Binding.oneWay('V.noteViewController.didStartArchived').not(),
            classNames: ['juniper-button', 'juniper-archive-button'],
            action: 'doArchiveNote'
          }),
          dearchiveButtonView: SC.ButtonView.extend({
            layout: { height: 44, width: 44, right: 0 },
            isVisibleBinding: SC.Binding.oneWay('V.noteViewController.didStartArchived'),
            classNames: ['juniper-button', 'juniper-dearchive-button'],
            action: 'doUnarchiveNote'
          })
        }),

        typographyView: V.TypographyView.extend({
          isVisible: NO
        }),

        toolbarOpenOverlayView: SC.View.extend(V.FadeTransitionFast, {
          isVisible: NO,
          classNames: ['juniper-toolbar-overlay'],
          click: function() {
            V.statechart.sendAction('doHideToolbars');
          },
          touchStart: function() {
            return YES;
          },
          touchEnd: function() {
            V.statechart.sendAction('doHideToolbars');
          }            
        }),
        shareToolbarView: SC.View.extend(V.SlideFromTopTransitionFast, {
          layout: { height: 77, borderBottom: 1 },
          isVisible: NO,
          classNames: ['juniper-subheader-toolbar'],

          childViews: ['wrapperView'],
          wrapperView: SC.View.extend({
            layout: { width: 229, centerX: 0 },
            childViews: ['mailButtonView'],
            mailButtonView: SC.ButtonView.extend({
              layout: { centerX: 0, width: 75 },
              classNames: ['juniper-button', 'juniper-subheader-button', 'juniper-share-mail-button'],
              localize: YES,
              title: 'V.Share.Mail',
              action: 'doShareNoteByMail'
            })
          })
        }),
        menuOpenOverlayView: SC.View.extend({
          isVisibleBinding: SC.Binding.oneWay('V.mainViewController.menuIsOpen'),
          // TODO: Actual event handling.
          click: function() {
            V.statechart.sendAction('doCloseMenu');
          },
          touchStart: function() {
            return YES;
          },
          touchEnd: function() {
            V.statechart.sendAction('doCloseMenu');
          }
        })
      }),
      
      creditsView: V.CreditsView.extend(SC.ActionSupport, V.FadeTransitionFast, {
        isVisible: NO,
        // Action & events.
        target: 'V.statechart',
        action: 'doToggleMenu',
        click: function() {
          this.fireAction();
        },
        touchStart: function(evt) {
          this._touchOrigin = { x: evt.pageX, y: evt.pageY };
          evt.allowDefault();
          evt.stopPropagation();
          return YES;
        },
        touchesDragged: function(evt) {
          if (this._touchOrigin) {
            if (Math.abs(this._touchOrigin.x - evt.pageX) > 10 || Math.abs(this._touchOrigin.y - evt.pageY) > 10) {
              this._touchOrigin = null;
            }
          }
          evt.allowDefault();
          evt.stopPropagation();
          return YES;
        },
        touchEnd: function(evt) {
          if (this._touchOrigin) {
            this.fireAction();
          }
          this._touchOrigin = null;
          evt.allowDefault();
          evt.stopPropagation();
          return YES;
        }
      })
    })
  })
});