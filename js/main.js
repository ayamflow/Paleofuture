var timeline, crossnav;

document.ready = function()
{
	timeline = new Timeline();

	$.getJSON('data/articlesClean.json', function(data)
	{
		timeline.init(data);
	});
};