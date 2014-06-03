

V.NoteView = SC.View.extend({

  editorViewOutlet: SC.outlet('scrollView.contentView.editorView'),

  wantsAcceleratedLayer: YES,
  childViews: ['scrollView'],
  scrollView: SC.ScrollView.extend({
    layout: { bottom: 44 },
    verticalOverlay: YES,
    verticalScrollerView: SC.OverlayScrollerView,

    delaysContentTouches: NO,

    classNames: ['juniper-notes-view'],

    contentView: SC.View.extend({
      childViewLayout: SC.View.VERTICAL_STACK,
      childViews: ['imageView', 'editorView', 'tagsView'],
      imageView: SC.View.extend({
        layout: { height: 0 },
        isVisible: NO
      }),
      editorView: SC.WYSIWYGEditorView.extend({
        layout: { height: 20 },
        classNames: ['juniper-note', 'juniper-note-text', 'juniper-note-wrapper'],
        documentPadding: null,
        minHeight: 20,

        carriageReturnText: '<br>',

        // Archived.
        classNameBindings: ['didStartArchived:archived'],
        didStartArchivedBinding: SC.Binding.oneWay('V.noteViewController.didStartArchived'),

        isEnabledBinding: SC.Binding.oneWay('.didStartArchived').not(),
        
        // -----------------------------------
        // The content and the text.
        //

        // The Plan: A new note comes in. Our value is updated to its current text (translated
        // into HTML). From then on, we update the note's text indirectly, by pulling out the
        // element's innerText. We keep a specific eye on changes which impact the content of
        // the title line, and give them special handling.

        // We only update our value directly from the record when we get a new record.
        contentBinding: SC.Binding.oneWay('V.noteViewController.content'),
        contentDidChange: function() {
          // GATEKEEP: same content.
          var content = this.get('content'),
              priorContent = this._priorContent;
          if (content === priorContent) return;
          this._priorContent = content;
          this.set('value', this._markupForText(content ? content.get('text') : ''));
        }.observes('content'),

        _markupForText: function(text) {
          if (!text) return '';

          var lines = text.split('\n');
          var ret = V.TITLE_MARKUP_TEMPLATE.fmt(lines.shift() || '');
          ret += lines.join('<br>');

          return ret;
        }.property('text').cacheable(),

        _valueDidChange: function() {
          // GATEKEEP: Not changed by the user.
          if (!this._changeByEditor) return sc_super();
          // GATEKEEP: No layer.
          var $el = this.$().find('.sc-wysiwyg-editor-inner'),
              el = $el[0];
          if (!el) return sc_super();

          // Get all child nodes, including text nodes.
          var $contents = $el.contents();

          // Make sure the first element is a div with the title class.
          var $first = $contents.first(),
              first = $first[0],
              didWrapTitle;
          if (first) {
            // If the first element is a text node, wrap it in a title div.
            if (first.nodeType === 3 /*TEXT_NODE*/) {
              $first.wrap('<div class="juniper-note-title juniper-note-text">');
              didWrapTitle = YES;
            }
            // Otherwise, give it the title class and unwrap any children.
            else {
              $first.attr('class', 'juniper-note-title juniper-note-text');
              $first.children().contents().unwrap();
            }
          }

          // Make sure subsequent elements are bare text with proper line-breaks.
          // TODO: See if we still need this after carriageReturnMarkup fixes in rich-text-editor (e.g.
          // test with pasted content).
          var len = $contents.length,
              content, $content, $prev, i,
              previousWasUnwrapped, previousWasBr, previousIsNowBr;
          for (i = 1; i < len; i++) {
            // Get this content.
            content = $contents[i];
            $content = $(content);
            // If content is a text node or a <br>, see if it needs a <br> prepended.
            if (content.nodeType === 3 /*TEXT_NODE*/ || content.nodeName === 'BR') {
              // If we were just unwrapped, and the unwrapped text hasn't changed into a <br>, we need
              // to prepend a <br> to separate us from the previously block-level div.
              if (previousWasUnwrapped) {
                // Get whether the previous element is now a <br>.
                $prev = $content.prev();
                previousIsNowBr = $prev[0] ? $prev[0].nodeName === 'BR' : NO;
                if (!previousIsNowBr) $content.before('<br>');
              }
              previousWasUnwrapped = NO;
              previousWasBr = content.nodeName === 'BR';
            }
            // Otherwise unwrap it and prepend a <br> if needed.
            else {
              // If we're not the first body node, and the previous item wasn't an already-block-
              // level <br>, then prepend a <br>.
              if (i !== 1 && !previousWasBr) $content.before('<br>');
              // If we have any text, unwrap it; otherwise replace with a <br>. (This formalizes some
              // somewhat unreliable behavior by the browser.)
              if ($content.text()) $content.contents().unwrap();
              else $content.replaceWith('<br>');
              previousWasUnwrapped = YES;
              previousWasBr = NO;
            }
          }

          // Poke the browser's selection. This helps with some issues where the selection gets
          // stuck when the DOM around it changes. (We don't do this if we wrapped the title, the
          // selection should now be in a different place than the browser has it.)
          if (!didWrapTitle) {
            var sel = window.getSelection ? window.getSelection() : null;
            if (sel && sel.focusNode) {
              sel.extend(sel.focusNode, sel.focusOffset);
            }
          }

          // Get the text out and save it to the record.
          var $contents = $el.contents(),
              text = $el.contents().first().text(),
              len = $contents.length, i;
          if (len > 1) text += '\n';
          for (i = 1; i < len; i++) {
            if ($contents[i].nodeName === 'BR') text += '\n';
            else text += $($contents[i]).text();
          }

          V.noteViewController.setIfChanged('text', text);

          return sc_super();
        }.observes('value'),

        // TODO: Reenable and fix this.
        registerUndo: function() {},

      }),
      tagsView: SC.ScrollView.extend({
        layout: { height: 40 },
        hasVerticalScroller: NO,
        canScrollVertical: NO,
        alwaysBounceVertical: NO,

        // There's always a bit of hackiness getting scroll view options to behave.
        isHorizontalScrollerVisible: function() { return NO }.property().cacheable(),
        canScrollHorizontal: YES,
        contentView: SC.View.extend({
          childViewLayout: SC.View.HORIZONTAL_STACK,
          childViewLayoutOptions: {
            paddingBefore: 15,
            paddingAfter: 20,
            spacing: 13 /*hack alert: this value depends on the invisible-to-SC CSS padding in the tag views.*/
          },
          newTagContent: SC.Object.create({ name: 'Tag'.loc() }),
          content: null,
          contentBinding: SC.Binding.oneWay('V.noteTagsViewController.arrangedObjects'),
          // On init, set up a few example views ahead of time, for performance's sake.
          init: function() {
            this._tagViews = [];
            sc_super();
            for (var i = 0; i < 4; i++) {
              view = this.exampleView.create({ isVisible: NO });
              this._tagViews.push(view);
              this.insertBefore(view, this.newTagView);
            }
            return this;
          },
          _tagViews: null,
          contentDidChange: function() {
            this.beginPropertyChanges();
            var tags = this.get('content') || [],
                tagViews = this._tagViews,
                len = tags.get('length'),
                i, tag, view;
            // Populate the views, creating as needed.
            for (i = 0; i < len; i++) {
              tag = tags.objectAt(i);
              view = tagViews.objectAt(i);
              // If there is no view, create one from scratch.
              if (!view) {
                view = this.exampleView.create({ content: tag });
                tagViews.push(view);
                this.insertBefore(view, this.newTagView);
              } else {
                view.set('content', tag).set('isVisible', YES);
              }
            }
            // Hide remaining views, if any.
            len = tagViews.get('length');
            for (i; i < len; i++) {
              view = tagViews.objectAt(i);
              view.set('isVisible', NO);
            }
            // Wrap up.
            this.endPropertyChanges();
          }.observes('.content.[]'),
          exampleView: SC.ButtonView.extend(SC.AutoResize, {
            layout: { height: 26, },
            classNames: ['juniper-button', 'juniper-tag'],
            content: null,
            isEnabledBinding: SC.Binding.oneWay('V.noteViewController.didStartArchived').not(),
            titleBinding: SC.Binding.oneWay('*content.name'),
            action: 'doShowTagMenu'
          }),
          childViews: ['newTagView'],
          newTagView: SC.LabelView.extend(SC.AutoResize, {
            layout: { height: 26, width: 47, minWidth: 47 },
            isVisibleBinding: SC.Binding.oneWay('V.noteViewController.didStartArchived').not(),
            classNames: ['juniper-tag', 'juniper-new-tag'],
            isEditable: YES,
            localize: YES,
            hint: 'V.Tag',
            valueBinding: SC.Binding.oneWay('V.tagSearchController.text'),
            exampleEditor: SC.InlineTextFieldView.extend(SC.AutoResize, {
              classNames: ['juniper-new-tag-editor'],
              valueBinding: 'V.tagSearchController.text'
            }),
            inlineEditorDidCommitEditing: function(editor) {
              sc_super();
              // GATEKEEP: No value.
              var val = this.get('value');
              if (!val) return;
              // Add the tag.
              V.statechart.sendAction('doAddTagByName', SC.Object.create({ value: val }));
              // Reset our value.
              this.set('value', null);
              editor.set('value', null);
              V.tagSearchController.set('text', null); // don't know why both sides are required here.
              // Scroll our scroller all the way to the left.
              this.invokeNext(this.scrollIntoSight);
              // Queue up another tag!
              this.invokeNext(this.beginEditing);
            },
            inlineEditorDidDiscardEditing: function(editor) {
              sc_super();
              editor.set('value', null);
              V.tagSearchController.set('text', null); // don't know why both sides are required here.
            },
            scrollIntoSight: function() {
              this.parentView.parentView.parentView.set('horizontalScrollOffset', this.parentView.parentView.parentView.get('maximumHorizontalScrollOffset'));
            },
            click: function() {
              this.beginEditing();
            },
            touchStart: function() {
              return YES;
            },
            touchEnd: function() {
              this.beginEditing();
            },
            // hacky stuff
            init: function() {
              sc_super();
              V.tagSearchController.set('searchField', this);
              return this;
            }
          })
        })
      })
    })
  })
});
