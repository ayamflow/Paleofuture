var Timeline = function()
{
	this.top = $('#top');
	this.bottom = $('#bottom');
	this.timeline = $('#timeline');
	this.overlay = $('#overlay');
	this.times = $('#articles-thumbs');
	this.decades = [];
	this.decadesOffset = [];
	this.articlesByDecade = [];
	this.wrapperHeight = 605;
	this.gapWidth = window.innerWidth-50;//1270;
	this.baseWidth = this.gapWidth + 6;
	this.allArticles = [];

	//timeline hover :
	//http://thecodeplayer.com/walkthrough/magnifying-glass-for-images-using-jquery-and-css3
};

Timeline.prototype.init = function(data, categories)
{
		/* TODO */
	/*
		fermeture d'un article : scroll d'abord (fermeture invisible)
		parallaxes
		timeline
		
	*/



	this.articleViewer = new ArticleViewer(categories);
	this.allArticles = this.htmlize(data);
	data.sort(this.sortByYear);
	// Renvoie un double tableau des articles classés par décennie
	this.articlesByDecade = this.getArticlesByDecade(data);
	// Renvoie un tableau des 3-4 articles les plus populaires de chaque décennie
	this.articles = this.getPopularArticles(this.articlesByDecade);
	// Créée un documentFragment contenant les articles
	var fragment = this.renderArticles(this.articles);
	// Place un documentFragment d'articles sur la timeline
	this.dispatchArticles(fragment);

};

/*===============================*/
/*				EVENTS			 */
/*===============================*/

Timeline.prototype.attachEvents = function()
{
//	$('#timeline ul').delegate('li', 'click', this.onYearClick.bind(this));
	this.timeline.find('div').on('drag', this.onTimelineDrag.bind(this));
	$('#container').delegate('div.article', 'click', this.onArticleClick.bind(this));
	this.attachDecadeEvents();
};

Timeline.prototype.detachEvents = function()
{
	$('#timeline ul').undelegate('li', 'click', this.onYearClick.bind(this));
	$('#container').undelegate('div.article', 'click', this.onArticleClick.bind(this));
	this.detachDecadeEvents();
};

Timeline.prototype.attachDecadeEvents = function()
{
	this.overlay.delegate('div.decade-title', 'mouseenter', this.onDecadeMouseOver.bind(this));
	this.overlay.delegate('div.decade-title', 'mouseleave', this.onDecadeMouseOut.bind(this));
	this.overlay.delegate('div.decade-title', 'click', this.onDecadeClick.bind(this));
};

Timeline.prototype.detachDecadeEvents = function()
{
	this.overlay.off('mouseenter mouseleave click');
};

Timeline.prototype.onTimelineDrag = function(event, ui)
{
	var articlesWidth = Math.max(this.topWidth, this.bottomWidth) + parseInt(this.times.css('paddingLeft'), 10) + parseInt(this.times.css('paddingRight'), 10),
		timelineWidth = this.timeline.width() - this.timeline.find('div').width(),
		ratio = ui.position.left/timelineWidth * articlesWidth;
	console.log(ui.position.left, ratio);
	this.times.scrollLeft(ratio);
};

Timeline.prototype.onDecadeClick = function(event)
{
	this.articleViewer.clearArticleViewer();

	var $target = $(event.currentTarget),
		id = $target.index();

	this.clearGap(this.createGap, [id, $target, "decade"]);
};

Timeline.prototype.onDecadeMouseOver = function(event)
{
	$(event.currentTarget).addClass('pointer');
	var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
		target = '.decade-' + year;
};

Timeline.prototype.onDecadeMouseOut = function(event)
{
	$(event.currentTarget).removeClass('pointer');
	var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
		target = '.decade-' + year;
};

Timeline.prototype.onYearClick = function(event)
{
	this.articleViewer.clearArticleViewer();
	this.clearGap(this.scrollTimeline, [event]);
};

Timeline.prototype.onArticleClick = function(event)
{
	this.articleViewer.clearArticleViewer();

	var $target = $(event.currentTarget),
		id = $target.index();

	this.clearGap(this.createGap, [id, $target, "category"]);
};

/*===============================*/
/*		TIMELINE ANIMATION		 */
/*===============================*/

Timeline.prototype.showTimeline = function()
{
	this.hidePreloader();
	//this.timeline.jScrollPane();
	this.timeline.find('div').draggable({axis:"x", containment:"parent"});
	TweenMax.to(this.times, 1, {css:{opacity:1, paddingLeft : 600}}, Expo.easeInOut);
	this.times.width(window.innerWidth - this.times.offset().left);
	TweenMax.to(this.overlay, 1, {css:{left: 400}}, Expo.easeInOut);
};

Timeline.prototype.scrollTimeline = function(event)
{
	var scrollTo = $(event.target).attr('data-scroll');
	this.times.stop().animate({
		scrollLeft : scrollTo
	}, 1000, "easeInOutQuad");
};

Timeline.prototype.hidePreloader = function()
{
	$('#preload').hide();
};

Timeline.prototype.showPreloader = function()
{
	$('#preload').show();
};

Timeline.prototype.clearGap = function(callback, params)
{
	this.attachDecadeEvents();
	var timelineParams = callback && params ? {onComplete:callback.bind(this), onCompleteParams:params} : {},
		timelineInit = new TimelineMax(timelineParams),
		time = 0;

	this.overlay.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), time, {css:{opacity:1}}));
	});
	timelineInit.insert(TweenMax.to(this.overlay, time, {css:{top: '50%'}}));
	this.top.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), time, {css:{margin : 3}}));
	});
	this.bottom.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), time, {css:{margin : 3}}));
	});
	timelineInit.play();
};

Timeline.prototype.createGap = function(id, $target, type)
{
	var self = this;
	this.detachDecadeEvents();
	var $topDiv, $bottomDiv,
		topOffsetLeft, bottomOffsetLeft, ratio,
		year, targetYear,
		refTitle = $target.children().eq(1).text(), refArticle, refOffset,
		timelineArticle,
		topDivOffset, bottomDivOffset, topDivWidth, bottomDivWidth,
		i;

	if(type == "category")
	{
		year = parseInt($target.attr('class').split(' ')[0].split('decade-')[1], 10);
		$topDiv = this.top.children().eq(id);
		$bottomDiv = this.bottom.children().eq(id);

		for(i = 0, articles = this.articlesByDecade['articles-' + year], l = articles.length; i < l; i++)
		{
			if(articles[i].title == refTitle)
			{
				refArticle = articles[i];
			}
		}
	}
	else if(type == "decade")
	{
		year = parseInt($target.children().eq(0).text(), 10);
		$topDiv = this.top.find('.decade-' + year).eq(0);
		$bottomDiv = this.bottom.find('.decade-' + year).eq(0);

		for(i = 0, articles = this.articlesByDecade['articles-' + year], l = articles.length; i < l; i++)
		{
			if(articles[i].title == refTitle)
			{
				refArticle = articles[i];
			}
		}
	}

	if($topDiv.length === 0)
	{
		$topDiv = $target;
	}
	else if($bottomDiv.length === 0)
	{
		$bottomDiv = $target;
	}

	refOffset =	$topDiv.offset().left + $topDiv.width() > $bottomDiv.offset().left + $bottomDiv.width() ? $topDiv.offset().left + $topDiv.width() + 50 : $bottomDiv.offset().left + $bottomDiv.width() + 50;

	timelineArticle = new TimelineMax({onComplete:this.loadArticle.bind(this), onCompleteParams:[this.articles, refArticle, refOffset, type]});
	self.overlay.children().each(function(i)
	{
		targetYear = $(this).attr('class').split(' ')[1].split('title-')[1];
		if(targetYear && targetYear != year)
		{
			timelineArticle.insert(TweenMax.to($(this), 1, {css:{opacity:0}}, Expo.easeOut));
		}
	});
	timelineArticle.insert(TweenMax.to(self.overlay, 1, {css:{top: '40%'}}, Expo.easeOut));
	timelineArticle.insert(TweenMax.to($topDiv, 1, {css:{marginRight: this.gapWidth}, delay:0.15}, Expo.easeIn));
	timelineArticle.insert(TweenMax.to($bottomDiv, 1, {css:{marginRight: this.gapWidth}, delay:0.15}, Expo.easeIn));
	timelineArticle.gotoAndStop(0);

	this.times.stop().animate({
		scrollLeft : $target.offset().left + $target.width()//- 50// - $target.width()/2
	}, 1000, "easeOutQuad").promise().done(
	function()
	{
		timelineArticle.play();
	});
};

Timeline.prototype.createTimeline = function()
{
	this.decades.sort(this.sortByDecade);

	var that = this,
		cursor = $('<div/>').appendTo(this.timeline),
		ul = $('<ul/>').appendTo(this.timeline),//.width(this.decades.length*53),
		titlesFragment = $(document.createDocumentFragment());

	$.each(this.decades, function(i)
	{
		var li = $('<li/>')
		.text(that.decades[i])
		.appendTo(ul);
		var h2 = that.formatTitle(that.decades[i])
		.appendTo(titlesFragment);
	});

	this.dispatchTitles(titlesFragment);

	$('#timeline li').each(function(i)
	{
		var li = $(this);
		var year = li.text();
		var t = $('.title-' + year);
		li.attr({'data-scroll': t.offset().left - 200});
		if(i === 0)
		{
			// Pour le premier élément, on revient direct à x = 0
			li.attr({'data-scroll': 0});
		}
	});
	this.times.css('paddingRight', window.innerWidth/2);//wrapper.width() - this.overlay.children().last().offset().left);

	this.attachEvents();
	this.showTimeline();
};

Timeline.prototype.loadArticle = function(articles, article, offsetLeft, type)
{
	this.articleViewer.init(this.allArticles, article, offsetLeft, type);
};

Timeline.prototype.setWidth = function(container, callback)
{
	var divs = container.children(),
		length = divs.length,
		finalWidth = this.baseWidth;
	for(var i = 0; i < length; i++)
	{
		finalWidth += divs[i].clientWidth + 6;
	}
	container.width(finalWidth);

	if(callback)
	{
		var done = false,
			wrapper = this.times,
			intervalCallback,
			self = this;

		intervalCallback = setInterval(function()
		{
			if(!done && wrapper.height() == self.wrapperHeight)
			{
				done = true;
				clearInterval(intervalCallback);
				callback();
			}
		}, 50);
	}
	return finalWidth;
};

/*===============================*/
/*			FORMATTING			 */
/*===============================*/

Timeline.prototype.renderArticles = function(articles)
{
	var length = articles.length,
	articlesFragment = document.createDocumentFragment(),
	article;

	for(var i = 0; i < length; i++)
	{
		article = articles[i];
		if(article)
		{
			this.formatArticle(article).appendTo(articlesFragment);
		}
	}
	return articlesFragment;
};

Timeline.prototype.formatArticle = function(article)
{
	var year = article.decade;//this.yearToDecade(article.year);
		articleDiv = $('<div/>')
	.css('background', article.image ? 'url(' + article.image + ')' : '')
	.append( $('<h2 class="year">' + year + '</h2>') )
	.append( $('<h2>' + article.title + '</h2>') )
	//.append( $('<span class="date">' + article.date + "</span>") )
	.append( $('<span class="tags">' + article.tags.join(', ') + "</span>") )
	//.css({ 'background-image' : 'url(' + article.images[0] +')'})
	//.append( $('<div>' + article.content + '</div>') )
	.addClass('decade-' + year)
	.addClass('article');
	/*if(article.image)
	{
		articleDiv.css('background', 'url(' + article.image + ')');
	}*/
	this.updateDecades(year);
	return articleDiv;
};

Timeline.prototype.formatTitle = function(year)
{
		var titleDiv = $('<div/>')
		.addClass('decade-title')
		.addClass('title-' + year)
		.append($('<h2>' + year + '</h2>'));
		return titleDiv;
};

Timeline.prototype.dispatchArticles = function(data)
{
	var topFragment = document.createDocumentFragment(),
		bottomFragment = document.createDocumentFragment(),
		articles = $.makeArray($(data)[0].childNodes),
		length = articles.length,
		currentArticle, $current, position;

	for(var i = 0; i < length; i++)
	{
		currentArticle = articles[i];
		$current = $(currentArticle);
		position = Constants.timeline.align[i];
		if(position)
		{
			topFragment.appendChild(currentArticle);
			$current.css({
				width : Constants.timeline.width[i],
				height : Constants.timeline.height[i],
				top : 300 - Constants.timeline.height[i]
			});
		}
		else
		{
			bottomFragment.appendChild(articles[i]);
			$current.css({
				width : Constants.timeline.width[i],
				height : Constants.timeline.height[i]
			});
		}
		//console.log(currentArticle);
	}

	this.top.append(topFragment);
	this.bottom.append(bottomFragment);

	this.topWidth = this.setWidth(this.top);
	this.bottomWidth = this.setWidth(this.bottom, this.createTimeline.bind(this));
};

Timeline.prototype.dispatchTitles = function(data)
{
	var childs = data[0].childNodes,
		length = childs.length,
		i,
		yearDiv,
		year,
		divArray = Constants.timeline.decadeOffset,
		labelTop;
	
	/*for(i = 0, l = this.decades.length; i < l; i++)
	{
		var target = '.decade-' + this.decades[i];
		var t = $(target);
		var offset = Constants.timeline.decadeOffset[i] || 3000;//	t.eq(0).offset().left + t.eq(0).width()/2;
		divArray.push(offset);
	}*/

	for(i = 0; i < length; i++)
	{
		yearDiv = childs[i];
		year = yearDiv.childNodes[0].innerText;
		labelTop = i%2 === 0 ? 20 : 70;
		$(yearDiv).css('left', divArray[i] + $(yearDiv).width())
		.css('top', labelTop);//this.bottom.offset().top - $(yearDiv).height());
		this.decadesOffset.push(divArray[i] + $(yearDiv).width());
	}

	this.overlay.append(childs);
};

/*===============================*/
/*		GETTERS AND UTILITIES	 */
/*===============================*/

Timeline.prototype.htmlize = function(data)
{
	var l = data.length;

	for(var i = 0; i < l; i++)
	{
		data[i].text = "<p>" + data[i].text.replace('\n\n', "</p><p>")
        .replace('\n', "</p><p>")//"<br />")
        .replace("</p><p>", "</p>" + '\n' + "<p>") + "</p>";
        data[i].text.replace('<p> </p>', '');
	}
	return data;
};

Timeline.prototype.getArticlesByDecade = function(articles)
{
	var length = articles.length,
		decades = [],
		article, year, i, id;

	for(i=0; i < length; i++)
	{
		article = articles[i];
		year = article.decade;//this.yearToDecade(article.year);
		id = 'articles-' + year;

		if(!decades[id])
		{
			decades[id] = [];
			decades[id].year = year;
		}
		decades[id].push(article);
	}
	return decades;
};

Timeline.prototype.getPopularArticles = function(decades)
{
	var length = decades.length,
		keys = Object.keys(decades),
		keysLength = keys.length,
		articles,
		popularArticles = [];
		keys.sort(this.sortDecadeKeys);
	for(var i = 0; i < keysLength; i++)
	{
		articles = decades[keys[i]];
		if(articles)
		{
			articles.sort(this.sortByViews);
			for(var j = 0, k = Constants.timeline.count[i]; j < k; j++)
			{
				popularArticles.push(articles[j]);
			}
		}
	}
	return popularArticles;
};

Timeline.prototype.updateDecades = function(year)
{
	if(_.indexOf(this.decades, year) === -1)
	{
		this.decades.push(year);
	}
};

Timeline.prototype.yearToDecade = function(year)
{
	return year.substr(0, year.length-1) + "0";
};

Timeline.prototype.sortByViews = function(a, b)
{
	return a.views - b.views;
};

Timeline.prototype.sortByYear = function(a, b)
{
	return a.year - b.year;
};

Timeline.prototype.sortDecadeKeys = function(a, b)
{
	return a.split('articles-')[1] - b.split('articles-')[1];
};

Timeline.prototype.sortByDecade = function(a, b)
{
	return a - b;
};