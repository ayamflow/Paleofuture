var ArticleViewer = function()
{
	this.articleWrapper = $('#viewer');
	this.articlesByCategory = $('#byCategory');
	this.initialized = false;
};

ArticleViewer.prototype.init = function(data, article, offsetLeft)
{
	if(!this.initialized)
	{
		if(!article)
		{
			article = data[2];
		}

		this.offsetLeft = offsetLeft;

		var articlesFromCategory,
			category = article.category,
			articles = [],
			decade = this.yearToDecade(article.year),
			articleList;

		//data.sort(this.sortByDecade);
		articles = this.getArticlesFromDecade(data, decade);
		articles = this.getArticlesFromCategory(articles, category);
		articleList = this.updateArticlesList(articles, article);
		if(articleList.length > 1)
		{
			this.renderArticleList(articleList);
		}
		this.renderArticle(article);
		//this.categories = $.getJSON('data/categories.json', callback);
	}
	else
	{
		console.log('ArticleViewer already initialized');
		this.clearArticleViewer();
		this.initialized = false;
		this.init(data, article, offsetLeft);
	}
	this.initialized = true;
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

ArticleViewer.prototype.clearArticleViewer = function()
{
	this.articlesByCategory.html('');
	this.articleWrapper.html('');
};

ArticleViewer.prototype.renderArticleList = function(articles)
{
	var article, articlesFragment = document.createDocumentFragment();

	$(articlesFragment).append($('<li><h2>Other articles in ' + articles[0].category + '</h2></li>'));
	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = $('<li/>')
		.text(articles[i].title)
		.appendTo(articlesFragment);
	}
	this.articlesByCategory.append(articlesFragment);

};

ArticleViewer.prototype.renderArticle = function(article)
{
	var articleFragment = document.createDocumentFragment();
	$(articleFragment)
	.attr('id', 'article')
	.append( $('<h2>' + article.title + '</h2>') )
	.append( $('<span class="date">' + article.date + '</span>') )
	.append( $('<div class="content">' + article.content + '</div>') )
	.appendTo(this.articleWrapper);
	this.articleWrapper
	.css({'left' : this.offsetLeft})
	.css({'background' : 'yellow'})
	.find('.content').slimScroll({
		width : this.articleWrapper.width(),
		height : $('#timeline').offset().top - this.articleWrapper.offset().top - 150
	});
};

ArticleViewer.prototype.getArticlesFromDecade = function(articles, decade)
{
	var article, articleDecade, articlesFromDecade = [];

	for(var i = 0, l = articles.length; i < l; i++)
	{
		article = articles[i];
		articleDecade = this.yearToDecade(article.year);
		if(articleDecade == decade)
		{
			articlesFromDecade.push(article);
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