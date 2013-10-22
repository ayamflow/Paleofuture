#PALEOFUTURE
#### Design & concept, graphic design, development by Léa Mariani & Florian Morel

First project at Gobelins school. Reintepretation of Matt Novak's [Paleofuture blog](http://www.paleofuture.com/).

Conceived for Chrome with a resolution > 1440x900
*(WIP responsive)*

### Libraries
* Vanilla JS
* JQuery (selectors and stuff)
* JQuery UI (autocomplete, drag)
* PreloadJS (preload all images)
* Handlebars
* jqDock (Mac OS X like dock)
* lodash (better underscore.js)
* slimScroll
* Greensock (TimelineMax, TweenMax)
* rAF FTW
* Compass

### Structure
* /js/
	* main.js = preload & init
	* Timeline.js => main controller (handle timeline, articles, and main events)
	* ArticleViewer.js => Article View
	* other : misc utils

* Features
	* Timeline with dynamic current year and decade/year scrolling
	* Parallax & scroll of article container (depending on the timeline position)
	* Search engine with autocomplete on article name & result view
	* Article view :
    	* Related articles (right sidebar), category filters (left dock)
   		* toolbar with current category reminder and social features access (pin/share), ...

* Some undevelopped/fake features for the demo:
	* Pins page (access with Community > Submit) *(It's just a jpeg)*
	* Commentaries on article view *(It's just jpegs)*

Pretty much it. Although this project was not supposed to be totally working, I tried to code the smoothest experience possible. Minimal jank !