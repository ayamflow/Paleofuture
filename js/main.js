var timeline, articles, categories;

document.ready = function()
{
	timeline = new Timeline();

	$.getJSON('data/articles.json', function(data)
	{
		articles = data;
		$.getJSON('data/categories.json', function(data)
		{
			categories = data;
			timeline.init(articles, categories);
		});
	});
};