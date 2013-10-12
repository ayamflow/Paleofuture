var ArticleViewer = function(categories)
{
	this.container = $('#article');
	this.articleWrapper = $('#viewer');
    this.articlesByCategory = $('#articlesList');
	this.initialized = false;
	this.listScroll = 0;
    this.categories = categories['long'];
	this.shortCategories = categories['short'];
	this.domCategories = $('#categories');
    this.toolbar = $('.toolbar');
	this.createCategoriesList();
    this.noWheel = false;
};

ArticleViewer.prototype.init = function(allArticles, article, type, internal)
{
    this.friendOpen = false;
    this.albumOpen = false;
    this.commentsOpen = false;
    this.detachEvents();
    if(!this.initialized)
    {
		var articlesFromCategory,
			category,
			articles = [],
			decade = article.decade,
			articleList;

        this.allArticles = allArticles;
        this.type = type;
		articles = this.getArticlesFromDecade(allArticles, decade);
        if(type == "category")
        {
            category = article.category;
            articles = this.getArticlesFromCategory(articles, category);
        }
        this.articleList = this.setArticleNumber(allArticles, article.decade);
        this.renderView(articles, article, type, internal);
        this.attachEvents(article);
	}
	else
	{
		this.clearArticleViewer(true);
		this.initialized = false;
		this.init(allArticles, article, type, internal);
	}
	this.initialized = true;
    this.noWheel = true;

    setTimeout(function()
    {
        $('#categories .jqDockWrap').css({ height : $('#viewer').height() });
    }, 500);
};

ArticleViewer.prototype.createCategoriesList = function()
{
    var tmpCategories = [];
    for(var i = 0, l = this.categories.length; i < l; i++)
    {
        tmpCategories.push({short : this.shortCategories[i], long : this.categories[i]});
    }
    var li = Constants.templates.templates.categoriesList({
        categories : tmpCategories
    });
    this.domCategories.append($(li));
};

/*===============================*/
/*				EVENTS			 */
/*===============================*/

ArticleViewer.prototype.attachEvents = function(article)
{
    var self = this;
    this.toolbar.on('mouseenter', '*', this.hoverToolbar.bind(this));
    this.toolbar.on('mouseleave', '*', this.hoverToolbarEnd.bind(this));
    this.toolbar.on('click', '*:data:not(img)', article, this.onToolbarClick.bind(this));
    this.domCategories.on('mouseenter', 'div.jqDockItem', this.hoverCategory.bind(this));
    this.domCategories.on('mouseleave', 'div.jqDockItem', this.hoverEndCategory.bind(this));
    this.domCategories.on('click', 'div.jqDockItem', this.onCategoryClick.bind(this));
    this.articlesByCategory.find('li').on('click', this.onArticleClick.bind(this));
    this.articleWrapper.find('.share').on('click', 'span.comments', this.onCommentsClick.bind(this));
    this.articleWrapper.find('#pin').on('click', 'h3', this.onAccordeonClick.bind(this));
};

ArticleViewer.prototype.detachEvents = function()
{
	this.articlesByCategory.off('mouseover mouseleave click');
    this.toolbar.off();
    this.domCategories.off('click mouseenter mouseleave');
    this.articlesByCategory.find('li').off('click');
    this.articleWrapper.find('#pin').off('click');
};

ArticleViewer.prototype.onToolbarClick = function(event)
{
    event.stopPropagation();
    var $target = $(event.currentTarget),
        index = $target.attr('data-tip'),
        article = event.data;
    switch(index)
    {
        case "Pin this article": //pin
            var $pin = this.container.find('#pin');
            if($pin.is(':hidden'))
            {
                $pin.slideDown(100);
            }
            else
            {
                $pin.slideUp(100);
            }
            break;
        case "Matt Novak": //source

            break;
        case "Exclusive content": //exclusive

            break;
        default: //category

            break;
    }
};

ArticleViewer.prototype.onCategoryClick = function(event)
{
    var $target = $(event.currentTarget),
        category = $target.attr('data-category'),
    articles = this.getArticlesFromCategory(this.articleList, category);

    if(parseInt($target.attr('data-number'), 10) > 0)
    {
        this.init(this.allArticles, articles[0], "category", true);
    }
};

ArticleViewer.prototype.onArticleClick = function(event)
{
    var $target = $(event.currentTarget);
    var titre = $target[0].innerText,
        article = Utils.getArticleFromTitle(titre, this.allArticles);
    this.init(this.allArticles, article, this.type, true);
};

ArticleViewer.prototype.hoverToolbar = function(event)
{
    var $target = $(event.currentTarget), tip = $target.attr('data-tip'), $tooltip = this.articleWrapper.find('.tooltip');//this.toolbar.find('.tooltip');

    if(tip)
    {
        $tooltip.text(tip);
        TweenMax.to($tooltip, 0.4, {css:{opacity:1, left: $target.offset().left - this.articleWrapper.offset().left - 25}}, Expo.easeOut);
    }

};

ArticleViewer.prototype.hoverToolbarEnd = function(event)
{
    var $target = $(event.currentTarget);
    TweenMax.to(this.container.find('.tooltip'), 0.4, {css:{opacity:0}}, Expo.easeOut);
};

ArticleViewer.prototype.hoverCategory = function(event)
{
    var $target = $(event.currentTarget), tooltip, mouseY = event.pageY, $tooltip = $target.find('.tooltip'),
    dock = this.domCategories.find('.jqDockWrap'), number = dock.children().length + 1,
    top = dock.offset().top;

    TweenMax.to($tooltip, 0.4, {css:{opacity:1, marginLeft:85}}, Expo.easeOut);

    text =  $tooltip.parent().attr('data-number') + ' in ' + $tooltip.parent().attr('data-shortCategory');
    $tooltip.text(text);

    var dockTop = parseInt(dock.offset().top, 10),
        dockBottom = parseInt(dock.height() + dockTop, 10),
        dockHeight = parseInt(dock.find('.jqDockItem').height() * number, 10),
        newTop = Math.round(( (dockTop - mouseY) /100) * dockHeight / 2) + 50;
    dock.animate({top: newTop}, { queue:false, duration:300});
};

ArticleViewer.prototype.hoverEndCategory = function(event)
{
    var $target = $(event.currentTarget),
    $tooltip = $target.find('.tooltip');

    TweenMax.to($tooltip, 0.4, {css:{opacity:0, marginLeft:95}}, Expo.easeOut);
};

ArticleViewer.prototype.onAccordeonClick = function(event)
{
    var targetClass = $(event.currentTarget).parent()[0].className;
    //console.log(targetClass);
    if(targetClass == "album")
    {
        if(this.albumOpen)
        {
            this.albumOpen = false;
            if(!this.friendOpen)
            {
                TweenMax.to(this.articleWrapper.find('#pin'), 0.3, {css:{height : 142}});
            }
        }
        else
        {
            this.albumOpen = true;
            TweenMax.to(this.articleWrapper.find('#pin'), 0.3, {css:{height : 182}});
        }
    }
    else if(targetClass == "friend")
    {
        if(this.friendOpen)
        {
            this.friendOpen = false;
            if(!this.albumOpen)
            {
                TweenMax.to(this.articleWrapper.find('#pin'), 0.3, {css:{height : 142}});
            }
        }
        else
        {
            this.friendOpen = true;
            TweenMax.to(this.articleWrapper.find('#pin'), 0.3, {css:{height : 182}});
        }
    }
    this.articleWrapper.find('.' + targetClass + ' ul').slideToggle(300);
};

ArticleViewer.prototype.onCommentsClick = function(event)
{
    if(!this.commentsOpen)
    {
        this.commentsOpen = true;
        TweenMax.to(this.container.find('.viewport'), 0.15, {css:{height : 240}});
        TweenMax.to(this.container.find('.fakeComments'), 0.15, {css:{height : 290, top:237}});
    }
    else
    {
        this.commentsOpen = false;
        TweenMax.to(this.container.find('.viewport'), 0.15, {css:{height : 565}});
        TweenMax.to(this.container.find('.fakeComments'), 0.15, {css:{height : 0, top:550}});
    }

};

/*===============================*/
/*			RENDERING HTML		 */
/*===============================*/

ArticleViewer.prototype.clearArticleViewer = function(internal)
{
    this.noWheel = false;
    var $pin = this.articleWrapper.find('#pin'), time = 0.3;
    if(internal)
    {
        time = 0;
    }
	TweenMax.to(this.container, time, {css:{opacity:0, zIndex:-200, marginTop:-300}, delay:time }, Expo.easeOut);
    if($pin.length > 0)
    {
        TweenMax.to($pin , 0.4, {css:{top:'30%', opacity:0, display:'none'}}, Expo.easeIn);
    }
    this.initialized = false;
};

ArticleViewer.prototype.renderView = function(articles, article, type, internal)
{
    var title, html, toTop, shortCategoryIndex = _.indexOf(this.categories, article.category);

    if(type == "category")
    {
        title = 'Articles in ' + articles[0].category;
    }
    else
    {
        title = 'Articles in ' + articles[0].decade + '\'s';
    }

    var date = {
        month: Constants.date.month[article.date.m + 1],
        day: Constants.date.day[(article.date.d + 1)%7],
        dayNumber: article.date.d,
        year: article.date.y
    };

    html = Constants.templates.templates.articleView({
        title: article.title,
        text: article.text,
        image: article.bigImage || article.image,
        listTitle: title,
        otherArticles: articles,
        pinNumber:  article.pinned,
        comments: article.comments_size,
        date: date,
        category: article.category,
        shortCategory: this.shortCategories[shortCategoryIndex]
    });

    var height = $('.ten').offset().top - this.articleWrapper.offset().top - 220;

    this.articleWrapper
    .html($(html))
    .find('.content').slimScroll({
        width : this.articleWrapper.find('.content').width() - 12,
        height : height + 60
    });

    this.toolbar = $('.toolbar');
    this.articlesByCategory = $('#articlesList');
    this.articlesByCategory.css({ height : height + 100, overflow : 'hidden' });
    this.articlesByCategory.find('.scrollList').css({ height : height + 70 });
    this.articleWrapper.find('.content').width( this.articleWrapper.find('.content').width() - 5);
    this.container.find('#pin').hide(0).find('ul').hide(0);

    this.articlesByCategory.find('.scrollList').slimScroll({
        width : 180,
        height : height + 70
    });

    var timelineShow = new TimelineMax();
    if(internal)
    {
        timelineShow.insert(TweenMax.to(this.container, 0, {css:{opacity:1, zIndex:9999}}, Expo.easeOut));
    }
    else
    {
        timelineShow.insert(TweenMax.to(this.container, 0, {css:{opacity:1, zIndex:9999}}), 0);
    }
    timelineShow.play();
};

ArticleViewer.prototype.renderPinPopup = function(article)
{
    var html = Constants.templates.templates.pinPopup({
        article : article
    }),
    pin = this.articleWrapper.find('#pin');
    pin
    .html($(html))
    .css('display', 'block')
    .on('click', '*', article, this.onPinPopupClick.bind(this));
    TweenMax.fromTo(pin, 0.4, {css:{top:'30%', opacity:0}}, {css:{top:'25%', opacity:1}}, Expo.easeIn);
};

ArticleViewer.prototype.updateArticlesList = function(articles, article)
{
	var length = articles.length, articleList = [];

	for(var i = 0; i < length; i++)
	{
		if(articles[i].title != article.title)
		{
            articleList.push(articles[i]);
		}
	}
	return articleList;
};

/*===============================*/
/*		GETTERS AND UTILITIES	 */
/*===============================*/

ArticleViewer.prototype.setArticleNumber = function(articles, decade)
{
    var l = this.categories.length+1,
        categoriesNumber = [l],
        articlesList = articles,
        articlesLength,
        i, j;

    if(decade)
    {
        articlesList = this.getArticlesFromDecade(this.allArticles, decade);
    }
    articlesLength = articlesList.length;
    for(i = 0; i < l; i++)
    {
        categoriesNumber[i] = this.getArticlesFromCategory(articlesList, this.categories[i]).length;
    }

    var domLength = this.domCategories.length, self = this;
    this.domCategories.find('ul').jqDock({align:'center', size:45, sizeMax:90,
        onReady: function()
        {
            self.domCategories.find('.jqDock').css({ left : '10px'});
            self.domCategories.find('.jqDockItem').each(function(i)
            {
                $(this)
                .attr('data-number', categoriesNumber[i])
                .attr('data-category', self.categories[i])
                .attr('data-shortCategory', self.shortCategories[i]);

                var $tooltip = $(this).find('.tooltip');
                if($tooltip.length > 0)
                {
                    $tooltip.replaceWith('<span class="tooltip">' + categoriesNumber[i] + " in " + self.categories[i] + '</span>');
                }
                else
                {
                    $(this).prepend('<span class="tooltip">' + categoriesNumber[i] + " in " + self.categories[i] + '</span>');
                }
            });
            TweenMax.to(self.domCategories, 0.4, {css:{opacity:1}}, Expo.easeIn);
            self.domCategories.find('.jqDockItem[data-shortCategory=TV] .tooltip').text("2 in TV");
        }
    });


  return articlesList;
};

ArticleViewer.prototype.getArticlesFromDecade = function(articles, decade)
{
	var article, articleDecade, articlesFromDecade = [];
    articles.sort(this.sortByDate);
	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = articles[i];
		if(article)
		{
			articleDecade = article.decade;
			if(articleDecade == decade)
			{
				articlesFromDecade.push(article);
			}
		}
	}
	return articlesFromDecade;
};

ArticleViewer.prototype.getArticlesFromCategory = function(articles, category)
{
	var article, articleCategory, articlesFromCategory = [];

	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = articles[i];
		articleCategory = article.category;
		if(articleCategory == category)
		{
			articlesFromCategory.push(article);
		}
	}
	return articlesFromCategory;
};

ArticleViewer.prototype.sortByDate = function(b, a)
{
    return new Date(a.date.y, a.date.m, a.date.d) - new Date(b.date.y, b.date.m, b.date.d);
};