## Juniper: The Vesper-Inspired Web App

This project exists:

- To show that when done properly and with the right toolset, web apps can
  hold their own against most native apps, even and especially beautifully-
  designed and -executed ones like Q Branch's [Vesper](http://vesperapp.co/).
- To show that although SproutCore's learning curve is steep, once you're up
  it, you can build great apps quickly. It took fewer than a hundred hours
  to build this fully functional note-taking app.
- To provide a broadly functional, public SproutCore codebase. I don't want to
  hold this up as a paragon of SproutCore perfection (see note above about fewer
  than 100 hours), but it embodies a lot of best practices that I've picked up
  over the years.

### Guide to the Source

A monolith of code is unapproachable, so here's a roadmap to get you in. If you have
any questions about how or why I've done something, please feel free to hit me up at
[dcporter.net](http://dcporter.net), or on Twitter at
[davecporter](https://twitter.com/davecporter), and I'll do my best to help you out.
For general SproutCore questions, there are generally folks on
[the IRC channel](http://sproutcore.com/community/#tab=irc), and
[the mailing list](https://groups.google.com/group/sproutcore) is always open.

Other great SproutCore resources include [the Guides](http://guides.sproutcore.com/),
and the excellent book
[SproutCore Web Application Development](http://blog.sproutcore.com/sproutcore-book-available/)
by our lead developer, Tyler Keating. If you or your team is new to SproutCore, or if
your company needs a great web app to extend its presence online and in mobile, please
consider my [consultation/mentorship services](http://dcporter.net/hire-me/) to
supercharge your team's trip up the SproutCore learning curve.

Cheers – Dave

#### Root

The top-level files are `Buildfile`, which hold project-wide build configurations
(this is written in Ruby, as are SproutCore's build tools); a Sublime Text project
file (if that's your thing – it's mine); `.gitmodules`, which is how git keeps track
of submodules (see "Frameworks" below); and `.gitignore`, which is a useful file
for keeping other files out of the git project. Also this readme file and the license
(both suffixed in [accordance](http://daringfireball.net/linked/2014/01/08/markdown-extension)
with the wishes of the creator).

#### Frameworks: Foundations

The frameworks folder houses external frameworks, or frameworks that are shared
between apps in a project. This project only has one app, so the three frameworks
are all external repos that I want to use. I've structured these as git submodules
so that I can keep them up to date separately from the root project. (Git submodules
are a really fiddly, occasionally fragile feature of git that is entirely worth
the frustration to learn.)

In the `sproutcore` folder is SproutCore itself. If you're using the stable gem
release, you don't have to worry about this, but I'm developing against the latest
unreleased version, so I add it as a submodule here. (The build tools will automatically
prefer a version of `sproutcore` in your frameworks folder to the gem version.)
SproutCore is explicitly required by your application in its own Buildfile (see below)
via `:required => :sproutcore` (or `:required => [:sproutcore, ...]`). SproutCore itself
is made up of a couple dozen sub-frameworks, which you can include individually if you
prefer.

`rich-text-editor` is a rich text module for SproutCore that was originally developed by
@JoeGaudet at LearnDot. The official branch is at
[github.com/sproutcore/rich-text-editor](https://github.com/sproutcore/rich-text-editor);
I'm currently using the `team/dcporter/touch` branch which comes with provisional touch
support.

`sc-local-storage` is proof that [gists](https://gist.github.com/9514029.git) are
repos too. It's a SproutCore Data Source which serializes its data to local storage
instead of to a remote server. It should be plug-and-play for any app that only
needs to create and retain data locally, though see the documentation for a few
important usage notes. (If you need to also sync your data to a server... good luck.
Brent Simmons is smarter than me and [has been working on that
problem](http://inessential.com/2013/10/01/vesper_sync_diary_1) for quite a while.)

#### App(s)

Only one app in this project (like most projects), inside the `juniper` folder. It gets
its own Ruby `Buildfile`, where most of your app's build options will be specified.

With any SproutCore application, execution starts with `core.js`. This is where your
application object/namespace is defined, and it's where all of your global
constants should live.

In between, your files – which should mostly be defining classes (and the occasional
singleton) in preparation for app launch – are executed in alphabetical order. (That's
irrespective of whether it's a folder or a file.) For any files that have dependencies
on out-of-order files, just put `sc_require('folder/file.js');` at the top. (That's a
compiler directive by the way, meaning it will be observed even if it's commented out.)

At the other end is `main.js`, which contains your application's `main` method.
SproutCore calls this method once all of your application classes are created,
in order to kick off the app. In the case of a statechart application (all
applications should be statechart applications), this simply kicks off your
application statechart, which handles the rest!

##### The Statechart: Your New Bicycle

To get a statechart application, use the following terminal commands:

```
$ sc-gen project MyProject
$ cd my_project
$ sc-gen statechart_app MyApp
```

The application's state is owned by the statechart, which is defined in `statechart.js`.
This references states, which are defined in the `states` folder. Each state gets its
own file, while substates of each state are organized into folders. It's also super
easy to use your app's statechart to handle routes/URLs.

States handle events and actions, and trigger transitions, which allows your application's
business logic to be organized into discreet units with a known and controllable execution
order. If you're handling an event by checking a flag to see what part of the application
is showing, you should probably be using a statechart instead.

A simple example is the app's back button. It basically sits there, sometimes with some
text, sometimes the tappable area is a little bit wider, but mostly what it does is send
the `doGoBack` action to the statechart. Very appropriate for a simple view-layer control.

In the statechart, all current states are given the opportunity to handle each action, with
unhandled actions bubbling up from each one to its parent states until something, or nothing,
exposes a handler. In this case, the overall parent ReadyState handles it by toggling the
slideunder menu open or closed, while the child NoteState – which you're in when you're looking
at and editing a single note – handles it by returning to the list view. If you're in NoteState,
then the event bubbling stops there. If you're not, then the event bubbles up to ReadyState,
which handles it for everybody else. At no point does my `doGoBack` code have to look around
and figure out what state the application is in, because any particular method knows for sure
that it's in the correct state if it's even allowed to run. Beautiful.

A map of this application's statechart can be found in full ASCII glorii in `statechart.js`.
Details on the actions and events handled by each state can be found within the source. (Note
that actions and events are exactly the same thing as far as the statechart is concerned. For
the sake of code cleanliness, I treat past-tense verbs like `dragDidEnd` as events and
command-tense verbs like `doGoBack` as actions, because of English and words.)

Have I mentioned that you should learn and use statecharts? They're like sliced bread in
every way.

##### Controllers

In the "MVC" nomenclature, the statechart lives in the Controller layer, which mediates
loading data (see "The Data Layer") and displaying views (see "Views" below). Also in
the Controller layer are the controllers. In an application with a statechart, the
controllers are generally very thin. For example, `selected_note_controller.js` has one
controller in it, which simply holds an object (the selected note) for general consumption
(e.g. in the note editor view, and in the adjacent list-of-tags view).

A controller of note is the typography controller, in `typography_controller.js`. Instead of
being a `SC.ObjectController` or a `SC.ArrayController` – two classes whose job is to hold an
object or array for general consumption – it's a `SC.UserDefaults`. That class serves as a very
simple, well-conceived, stable, KVO-enabled wrapper around `localStorage`, and it's how this
app persists your typography settings when you reload. `SC.UserDefaults` is named after a
similar class in Cocoa, but you can use it any time you want to persist something, even if it
has nothing to do with a user's settings and their defaults. And since each instance can be
namespaced from other instances via the `appDomain` and `userDomain` properties, you can keep
your code well-organized by creating as many instances as you like.

##### The Stratified Data Layer

Data is loaded into the store (defined in core.js), which uses the local storage data
source defined in `data_sources`. The data source loads data as needed (in this case
from local storage – usually it will load from your server instead), and pipes the raw
data hashes into the store. The store exposes that data as records, which are instances
of a set of well-defined model classes defined in `models`.

So to review, the statechart queries the store for records; the store, if needed, requests
the raw data from the data source; the data source fetches and returns the raw data to the
store, which holds it centrally and exposes it as those records which were originally
queried by the statechart. (The statechart then takes that query and puts it in a
controller, from whence it gets used by the rest of the application.)

The benefit of this apparently convoluted approach is that a number of complicated systems
are isolated from each other. The store, which keeps raw data locally and exposes it
carefully, can confidently manage updates from the application and from the server. It can
also confidently execute complicated local queries via `SC.Query#local`, which is one of
SproutCore's powerful top-shelf features. The data source, meanwhile, serves as a simple,
REST-encouraging API for interfacing between the store and *any back-end system you have.*
If you've got a nice clean RESTful JSON API, great! If your API has given way to the
temptations of practicality and comes with a ton of deeply-nested data, including some that's
duplicating other API endpoints, then you might have some work to do to separate those records
for the local store and recombine them for POSTing back. But all of that complexity is well-
isolated within a custom data adaptor, and the rest of your application can get on with its
business.

##### Views

Individual view classes are defined in the `views` folder, while panes – root views, basically –
are in `panes`. Note that the entire view tree is defined with `extend()`, as classes within
classes within a `SC.Page` in `main_page.js`. The `SC.Page` class lazily instantiates each one
the first time it is accessed (make sure you `.get()` it). This approach is key to SproutCore's
highly-optimized approach to the view layer, and is considered an important best practice.

The application's main pane is in `main_pane.js`, and is in fact a `SC.MainPane`. Since much of
the view layer is made of singleton views, there's little to be gained in my experience by splitting
them out into multiple interwoven files, so `main_pane.js` contains most of the application's view
layer. You can follow the view tree by tracing from the root pane down through each view's
`childViews` array.

At a high level, Juniper's main pain contains an underlying menu and an overlaying main view; the
main view has a header and a content section; the content section contains each of the views which
flit and fade around to create Juniper's implementation of Vesper's beautiful design.

The views and their transitions are managed by their own statecharts, which are mixed in to complex
views, and which for lack of a better home live in `view_statecharts.js`. View statecharts enable
very complex interactions by providing a firm, stablizing framework within which to isolate aspects
of that behavior. My favorite example is the notes list view (see `views/notes_list_view.js` and the
NotesListViewStatechart mixin in `view_statecharts.js`), which lets the user scroll, select a note,
or rearrange notes, with intuitive behavior carefully, separately, and easily customized for touch
and mouse input. There's a lot of code in that statechart, but most of it is the fiddly math required
to place views over views; implementing it without a statechart would have been much, much worse.

##### CSS & Images

Like other application development environments, SproutCore defaults to absolutely-positioned views.
SproutCore's layout engine is JavaScript-based, and it enables some great features. That means that you
will be defining the vast majority of your layouts in JavaScript rather than in CSS. It implements
responsive design in two parts: by being stretchy and screen-filling by default, and through a new
feature called [Design Modes](http://showcase.sproutcore.com/#demos/Responsive%20Design) that will
be arriving in version 1.11, available soon.

Other than layout, SproutCore loves CSS. It even comes with built-in support for the great CSS
preprocessor Sass, which among other things lets you define and use variables, and nest your
selectors. There are some magical shenanigans with `_theme.css`, documented inside it, which you
should read up on. Otherwise, you just add CSS classes to your views with the `classNames` property
(and the handy dynamic [`classNameBindings`](http://blog.sproutcore.com/classnamebindings-easy-dynamic-css/)
property), and then apply styles to your heart's content.

SproutCore's build tools also come with built-in support for auto-spriting images, and for serving
higher resolution retina resources. To get your images auto-sprited, just reference them in your
CSS like this: `@include slice('../images/menu-icon-sproutcore.png');` (path names relative to the
stylesheet). To serve a double-resolution version to retina devices, all you have to do is include
a retina resource with the same name with '@2x' at the end: For example, in this case, the images
folder has a file called `menu-icon-sproutcore.png` and one called `menu-icon-sproutcore@2x.png`.
It just works!

##### Odds and ends

Some other points of interest.

Localizing your application for different languages is easy with SproutCore. In the `en` folder, I've
defined the default English localization, with a library of key/value pairs. You can use the keys in
your UI instead of raw strings; with `SC.LabelView` and a few other supported views, you can just set
`localize: YES`; in your own custom views, you can call `.loc()` on the key itself.

Along with stylesheets and images (see "CSS & Images" above), the `resources` folder contains some other
stuff:
- `resources/fixtures` has some JSON data that's used with the app's funky version-controlled
  default notes system implemented in `data_sources/local_storage_data_source`).
- `resources/fonts` has the app's web fonts. Using web fonts with SproutCore is no different than using
  them on a regular web page: I've defined their CSS font families in `stylesheets/fonts.css`, and
  triggered some basic preloading by including invisible references to them in `loading.rhtml` (see
  below).
- `resources/favicon.ico` is the app's favicon. It gets included in the generated index.html via this
  line in the app's Buildfile: `:favicon => 'favicon.ico'`. (References to files via the build tools
  or `sc_static()` calls are automatically sought within `resources` folders.)
- `resources/loading.rhtml` is for customizing the loading screen which is displayed while the rest of
  the app's JavaScript is downloaded and executed. If you build your app correctly (see "Notes on
  Deployment" below), this screen will only show up briefly when a user first visits your app's page,
  and will disappear nearly instantaneously thereafter. However, it's the first impression that a user
  will have of your application, so make it pretty! This app also uses it to trigger some rudimentary
  web-font preloading, shortening or eliminating the font-blink that accompanies any use of novel web
  fonts. (Note that most changes you could wish to make to the app's generated HTML file are handled
  by options in the Buildfile, like `:favicon` described above. If you need to make further changes to
  the generated index file, its full template is in `frameworks/sproutcore/lib`; you can make a copy in
  your app's `resources` folder and modify it to your heart's content. Note that you should only do this
  as a last resort, as it will cause your index to fall behind future changes to SproutCore's template,
  like the recently-added `minimal-ui` viewport flag.)

##### Notes on Deployment

For production, SproutCore's build tools combine your code files (and, separately, your stylesheets)
into a single, minified file. This sets you up for the absolute best case in load speed and cacheability,
but there's a little extra work you have to do.

- First, run `sc-build my-app`. This builds your app into `tmp/build/static`. Its index is at
  `tmp/build/static/my-app/en/{build-specific hash}/index.html`.
- Copy the entire `static` folder to your server. Alternatively, you can just copy the new {build-specific
  hash} folder to its correct location.
- In the app's root, symlink index.html to the generated index within the {build-specific hash} folder.
  Symlinking rather than copying allows for one-step rollbacks: if you need to un-publish a new version,
  just symlink back to the index.html file in the previous stable build.
- The first time you deploy, set up caching rules via `.htaccess` (for Apache; for nginx see
  HttpHeadersModule) to make the root (symlinked) `index.html` file always refresh, and every (build-hash
  protected) resource file cached for a full year (the longest value you can safely specify). This causes
  the browser to load the very thin `index.html` file every time, but to cache the built-specific files
  in their build-specific folders forever.

This gives you the best case for load performance through aggressive and automatically-controlled caching,
and in general your users won't even be able see your app's "Loading..." screen the second time they visit.
If you need to eke additional performance out for the user's initial load, you can split your app into
modules and defer loading them until after the initial load is complete and the app is running.

### License: The English Version

This project is intended for inspiration and instruction, but it's based on the copyrighted design and
behavior of Q Branch's Vesper, which is used with permission. I can give you permission to use any code
in this project in any way you want, as long as it doesn't impinge on Q Branch's copyrighted design. I
obviously can't give you any permissions regarding Q Branch's copyrighted designs, you'd have to talk to
them about that.

See LICENSE.markdown for the legal version.
