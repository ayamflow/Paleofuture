var Timeline = function()
{
	this.top = $('#top');
	this.bottom = $('#bottom');
	this.timeline = $('#timeline');
	this.overlay = $('#overlay');
	this.decades = [];
	this.decadesOffset = [];
	this.articlesByDecade = [];
	this.wrapperHeight = 605;
	this.baseWidth = 1006;
	this.articleViewer = new ArticleViewer();
};

Timeline.prototype.init = function(data)
{
	data.sort(this.sortByDecade);
	// Renvoie un double tableau des articles classés par décennie
	this.articlesByDecade = this.getArticlesByDecade(data);
	// Renvoie un tableau des 3-4 articles les plus populaires de chaque décennie
	this.articles = this.getPopularArticles(this.articlesByDecade);
	// Créée un documentFragment contenant les articles
	var fragment = this.renderArticles(this.articles);
	// Place un documentFragment d'articles sur la timeline
	this.dispatchArticles(fragment);

};

Timeline.prototype.attachEvents = function()
{
	$('#timeline ul').delegate('li', 'click', this.onYearClick.bind(this));
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
};

Timeline.prototype.detachDecadeEvents = function()
{
	this.overlay.off('mouseenter mouseleave');
	//this.overlay.undelegate('div.decade-title', 'mouseenter', this.onDecadeMouseOver.bind(this));
	//this.overlay.undelegate('div.decade-title', 'mouseleave', this.onDecadeMouseOut.bind(this));
};

Timeline.prototype.onDecadeMouseOver = function(event)
{
	var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
		target = '.decade-' + year;

	$(target).each(function()
	{
		$(this).css('backgroundColor', 'rgba(255,255,0,0.2)');
	});
};

Timeline.prototype.onDecadeMouseOut = function(event)
{
	var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
		target = '.decade-' + year;

	$(target).each(function()
	{
		$(this).css('backgroundColor', 'rgba(0,0,0,0.2)');
	});
};

Timeline.prototype.onYearClick = function(event)
{
	this.clearGap(this.scrollTimeline, [event]);
};

Timeline.prototype.onArticleClick = function(event)
{
	var $target = $(event.currentTarget),
		id = $target.index();

	this.clearGap(this.createGap, [id, $target]);
};

Timeline.prototype.createGap = function(id, $target)
{
	var self = this;
	this.detachDecadeEvents();
	var $topDiv = this.top.children().eq(id),
		$bottomDiv = this.bottom.children().eq(id),
		topOffsetLeft = $topDiv.offset().left - $(window).scrollLeft(),
		bottomOffsetLeft = $bottomDiv.offset().left - $(window).scrollLeft(),
		ratio = ((topOffsetLeft + bottomOffsetLeft) / 2) / window.innerWidth,
		gap = 1000,
		year = parseInt($target.attr('class').split(' ')[0].split('decade-')[1], 10),
		targetYear,
		refTitle = $target.children().eq(1).text(), refArticle, refOffset = $target.offset().left - $(window).scrollLeft() + $target.width(),
		timelineArticle;
	for(var i = 0, articles = this.articlesByDecade['articles-' + year], l = articles.length; i < l; i++)
	{
		if(articles[i].title == refTitle)
		{
			refArticle = articles[i];
		}
	}

	timelineArticle = new TimelineMax({onComplete:this.loadArticle.bind(this), onCompleteParams:[this.articles, refArticle, refOffset]});
	self.overlay.children().each(function(i)
	{
		//targetYear = parseInt($(this).eq(i).children().eq(0).html(), 10);
		//if(targetYear && targetYear != year)
		//{
			timelineArticle.insert(TweenMax.to($(this), 1, {css:{opacity:0}}, Expo.easeOut));
		//}
	});
	timelineArticle.insert(TweenMax.to(self.overlay, 1, {css:{top: '40%'}}, Expo.easeOut));
	timelineArticle.insert(TweenMax.to($topDiv, 1, {css:{marginRight: gap}, delay:0.15}, Expo.easeIn));
	timelineArticle.insert(TweenMax.to($bottomDiv, 1, {css:{marginRight: gap}, delay:0.15}, Expo.easeIn));
	timelineArticle.gotoAndStop(0);

	$('body').stop().animate({
		scrollLeft : $target.offset().left - $target.width()/2
	}, 800, "easeOutQuad").promise().done(
	function()
	{
		timelineArticle.play();
	});

};

Timeline.prototype.loadArticle = function(articles, article, offsetLeft)
{
	this.articleViewer.init(articles, article, offsetLeft);
};

Timeline.prototype.clearGap = function(callback, params)
{
	this.attachDecadeEvents();
	var timelineParams = callback && params ? {onComplete:callback.bind(this), onCompleteParams:params} : {};
	var timelineInit = new TimelineMax(timelineParams);

	this.overlay.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), 0.3, {css:{opacity:1}}));
	});
	timelineInit.insert(TweenMax.to(this.overlay, 0.3, {css:{top: '50%'}}));
	this.top.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), 0.3, {css:{margin : 3}}));
	});
	this.bottom.children().each(function()
	{
		timelineInit.insert(TweenMax.to($(this), 0.3, {css:{margin : 3}}));
	});
	timelineInit.play();
};

Timeline.prototype.scrollTimeline = function(event)
{
	var scrollTo = $(event.target).attr('data-scroll');
	$('html, body').stop().animate({
		scrollLeft : scrollTo
	}, 1000, "easeInOutQuad");
};

Timeline.prototype.createTimeline = function()
{
	//this.decades.sort(this.sortByDecade);

	var that = this,
		ul = $('<ul/>').appendTo(this.timeline),
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
	var wrapper = $('#articles-thumbs');
	wrapper.css('paddingRight', window.innerWidth/2);//wrapper.width() - this.overlay.children().last().offset().left);

	this.attachEvents();
	this.showTimeline();
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
			wrapper = $('#articles-thumbs'),
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
	}

	this.top.append(topFragment);
	this.bottom.append(bottomFragment);

	this.setWidth(this.top);
	this.setWidth(this.bottom, this.createTimeline.bind(this));
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

Timeline.prototype.showTimeline = function()
{
	this.hidePreloader();
	TweenMax.to($('#articles-thumbs'), 1, {css:{opacity:2, paddingLeft : 600}}, Expo.easeInOut);
	TweenMax.to(this.overlay, 1, {css:{left: 400}}, Expo.easeInOut);
};

Timeline.prototype.hidePreloader = function()
{
	$('#preload').hide();
};

Timeline.prototype.showPreloader = function()
{
	$('#preload').show();
};

Timeline.prototype.updateDecades = function(year)
{
	if(_.indexOf(this.decades, year) === -1)
	{
		this.decades.push(year);
	}
};

Timeline.prototype.formatTitle = function(year)
{
		var titleDiv = $('<div/>')
		.addClass('decade-title')
		.addClass('title-' + year)
		.append($('<h2>' + year + '</h2>'));
		return titleDiv;
};

Timeline.prototype.getArticlesByDecade = function(articles)
{
	var length = articles.length,
		decades = [],
		article, year, i, id;

	for(i=0; i < length; i++)
	{
		article = articles[i];
		year = this.yearToDecade(article.year);
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

Timeline.prototype.renderArticles = function(articles)
{
	var length = articles.length,
	articlesFragment = document.createDocumentFragment();

	for(var i = 0; i < length; i++)
	{
		this.formatArticle(articles[i])
		.appendTo(articlesFragment);
	}
	return articlesFragment;
};

Timeline.prototype.formatArticle = function(article)
{
	var year = this.yearToDecade(article.year);
		articleDiv = $('<div/>')
	.append( $('<h2 class="year">' + year + '</h2>') )
	.append( $('<h2>' + article.title + '</h2>') )
	.append( $('<span class="date">' + article.date + "</span>") )
	//.css({ 'background-image' : 'url(' + article.images[0] +')'})
	//.append( $('<div>' + article.content + '</div>') )
	.addClass('decade-' + year)
	.addClass('article');
	this.updateDecades(year);
	return articleDiv;
};

Timeline.prototype.getPopularArticles = function(decades)
{
	var length = decades.length,
		keys = Object.keys(decades),
		keysLength = keys.length,
		articles,
		popularArticles = [];

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

Timeline.prototype.yearToDecade = function(year)
{
	return year.substr(0, year.length-1) + "0";
};

Timeline.prototype.sortByViews = function(a, b)
{
	return b.views - a.views;
};

Timeline.prototype.sortByDecade = function(a, b)
{
	return b.year - a.year;
};