
sc_require('models/note_model');
sc_require('views/note_breviary_view');
sc_require('views/typography_text_weight_button_view');

V.TypographyView = SC.ScrollView.extend({
  classNames: ['juniper-typography-view'],

  verticalOverlay: YES,
  verticalScrollerView: SC.OverlayScrollerView,

  contentView: SC.View.extend({

    layout: { height: 500 },

    // Height. Observe the two things that can change the size of the sample view, and
    // update accordingly.
    heightMightHaveChanged: function() {
      this.sampleView.notifyPropertyChange('frame');
      this.invokeOnce(this.updateHeight);
    }.observes('V.typographyController.textSize', 'V.typographyController.textWeight'),
    updateHeight: function() {
      var frame = this.sampleView.get('borderFrame');
      this.adjust('height', frame.y + frame.height + 30);
    },

    childViews: ['smallCapsView', 'textSizeView', 'textWeightView', 'sampleView'],

    smallCapsView: SC.View.extend({
      layout: { top: 30, height: 44, borderTop: 1, borderBottom: 1 },
      classNames: ['juniper-typography-control'],
      childViews: ['wrapperView'],
      wrapperView: SC.View.extend({
        layout: { width: 320, centerX: 0 },
        childViews: ['labelView', 'toggleView'],
        labelView: SC.LabelView.extend({
          layout: { left: 22, right: 75 },
          classNames: ['juniper-typography-title'],
          value: 'V.Typography.SmallCaps',
          localize: YES
        }),
        toggleView: SC.CheckboxView.extend({
          layout: { height: 30, width: 52, centerY: 0, right: 21 },
          classNames: ['juniper-toggle-button'],
          themeName: 'juniper',
          valueBinding: 'V.typographyController.smallCaps'
        })
      })
    }),
    textSizeView: SC.View.extend({
      layout: { top: 105, height: 88, borderTop: 1, borderBottom: 1 },
      classNames: ['juniper-typography-control'],
      childViews: ['wrapperView'],
      wrapperView: SC.View.extend({
        layout: { width: 320, centerX: 0 },
        childViews: ['weeLetterView', 'bigOlLetterView', 'sliderView'],
        // Note that the layout on the letter labels is weird and a bit hacky. Might be better to just
        // render them up a level.
        weeLetterView: SC.LabelView.extend({
          layout: { left: 18, top: 18, width: 18, height: 18 },
          classNames: ['juniper-typography-letter', 'juniper-typography-wee-letter'],
          render: function(context) {
            context.push('V.Typography.SampleLetter'.loc());
          }
        }),
        bigOlLetterView: SC.LabelView.extend({
          layout: { right: 12, top: 18, width: 18, height: 18 },
          classNames: ['juniper-typography-letter', 'juniper-typography-big-letter'],
          render: function(context) {
            context.push('V.Typography.SampleLetter'.loc());
          }
        }),
        sliderView: SC.SliderView.extend({
          layout: { top: 43, height: 30, left: 23, right: 23 },
          classNames: ['juniper-slider'],
          valueBinding: 'V.typographyController.textSize',
          minimum: 0,
          maximum: 4,
          step: 1
        })
      })
    }),
    textWeightView: SC.View.extend({
      layout: { top: 212, height: 114 },
      childViews: ['titleView', 'controlView'],
      // Widths of 276 = 320 minus two 22px margins.
      titleView: SC.LabelView.extend({
        layout: { height: 26, width: 276, centerX: 0 },
        classNames: ['juniper-typography-header'],
        value: 'V.Typography.TextWeight',
        localize: YES
      }),
      controlView: SC.View.extend({
        layout: { top: 25 },
        classNames: ['juniper-typography-control'],
        childViews: ['lightButtonView', 'regularButtonView'],
        lightButtonView: V.TypographyTextWeightButtonView.extend({
          layout: { width: 320, centerX: 0, height: 44 },
          value: V.TEXT_WEIGHT.LIGHT,
          title: 'V.Typography.TextWeight.Light'
        }),
        regularButtonView: V.TypographyTextWeightButtonView.extend({
          layout: { width: 320, centerX: 0, height: 44, bottom: 0 },
          classNames: ['bottom'],
          value: V.TEXT_WEIGHT.REGULAR,
          title: 'V.Typography.TextWeight.Regular'
        })
      })
    }),
    sampleView: V.NoteBreviaryView.extend({
      layout: { top: 357, borderTop: 1, borderBottom: 1 },
      useStaticLayout: YES,
      classNames: ['juniper-typography-control'],
      content: SC.Object.create({
        truncatedText: function() {
          return 'V.Typography.SampleNote'.loc();
        }.property().cacheable(),
        breviaryMarkup: V.Note.prototype.breviaryMarkup /*very hack.*/
      })
    })
  })
});
