var timeline, crossnav;

document.ready = function()
{
	timeline = new Timeline();
	crossnav = new CrossNav();

	$.getJSON('data/contents.json', function(data)
	{
		timeline.init(data);
	});
};