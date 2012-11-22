var ArticleViewer = function()
{
	this.container = $('#article');
	this.articleWrapper = $('#viewer');
	this.articlesByCategory = $('#byCategory');
	this.sideTitle = this.articlesByCategory.find('h2');
	this.initialized = false;
	this.listScroll = 0;
};

ArticleViewer.prototype.init = function(data, article, offsetLeft, type)
{
	if(!this.initialized)
	{
		if(!article)
		{
			article = data[2];
		}

		this.offsetLeft = offsetLeft;

		var articlesFromCategory,
			category,
			articles = [],
			decade = article.decade,//this.yearToDecade(article.year),
			articleList;

		//data.sort(this.sortByDecade);
		articles = this.getArticlesFromDecade(data, decade);
		if(type == "category")
		{
			category = article.category;
			articles = this.getArticlesFromCategory(articles, category);
		}
		articleList = this.updateArticlesList(articles, article);
		if(articleList.length > 1)
		{
			this.renderArticleList(articleList, type);
		}
		this.renderArticle(article);
		//this.categories = $.getJSON('data/categories.json', callback);
	}
	else
	{
		console.log('ArticleViewer already initialized');
		this.clearArticleViewer();
		this.initialized = false;
		this.init(data, article, offsetLeft, type);
	}
	this.initialized = true;
	this.attachEvents();
};

/*===============================*/
/*				EVENTS			 */
/*===============================*/

ArticleViewer.prototype.attachEvents = function()
{
	this.articlesByCategory.delegate('ul', 'mouseover', this.onListMouseOver.bind(this));
};

ArticleViewer.prototype.detachEvents = function()
{
	this.articlesByCategory.off('mouseover mouseleave');
};

ArticleViewer.prototype.onListMouseOver = function(event)
{
	var ref = this.sideList.offset().top,
		mouseY = event.clientY - ref;
	if(mouseY < 150)
	{
		this.listScroll -= 5;
	}
	else if(mouseY > this.sideList.height() - 150)
	{
		this.listScroll += 5;
	}
	this.sideList.scrollTop(this.listScroll);
};

/*===============================*/
/*			RENDERING HTML		 */
/*===============================*/

ArticleViewer.prototype.clearArticleViewer = function()
{
	this.detachEvents();
	TweenMax.to(this.container, 1, {css:{opacity:1}}, Expo.easeOut);
	this.articlesByCategory.html('');
	this.articleWrapper.html('');
};

ArticleViewer.prototype.renderArticleList = function(articles, type)
{
	var article, title, list, articlesFragment = document.createDocumentFragment();

	if(type == "category")
	{
		title = '<h2>Other articles in ' + articles[0].category + '</h2>';
	}
	else
	{
		title = '<h2>Other articles in ' + articles[0].decade + '\'s</h2>';
	}

	list = $('<ul/>');
	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = $('<li/>')
		.text(articles[i].title)
		.appendTo(list);
	}

	$(articlesFragment).prepend(title).append(list);
	this.articlesByCategory.append(articlesFragment);
	this.sideList = this.articlesByCategory.find('ul');
	this.sideList.height($('#timeline').offset().top - this.articleWrapper.offset().top - 150);
};

ArticleViewer.prototype.renderArticle = function(article)
{
	this.container
	.css({'left' : this.offsetLeft})
	.css({'opacity' : 0});
	var articleFragment = document.createDocumentFragment();
	$(articleFragment)
	.attr('id', 'article')
	.append( $('<h2>' + article.title + '</h2>') )
	//.append( $('<span class="date">' + article.date + '</span>') )
	.append( $('<div class="content">' + article.text + '</div>') )
	.appendTo(this.articleWrapper);
	this.articleWrapper
	.find('.content').slimScroll({
		width : this.articleWrapper.width(),
		height : $('#timeline').offset().top - this.articleWrapper.offset().top - 150
	});
	TweenMax.to(this.container, 1, {css:{opacity:1}}, Expo.easeOut);
};

ArticleViewer.prototype.updateArticlesList = function(articles, article)
{
	var length = articles.length, articleList = [];

	for(var i = 0; i < length; i++)
	{
		//console.log(articles[i].title, article.title);
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

ArticleViewer.prototype.getArticlesFromDecade = function(articles, decade)
{
	var article, articleDecade, articlesFromDecade = [];

	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = articles[i];
		if(article)
		{
			articleDecade = article.decade;//this.yearToDecade(article.year);
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

ArticleViewer.prototype.yearToDecade = function(year)
{
	return year.substr(0, year.length-1) + "0";
};

ArticleViewer.prototype.sortByDecade = function(a, b)
{
	return b.year - a.year;
};