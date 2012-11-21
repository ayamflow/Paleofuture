var timeline, crossnav;

document.ready = function()
{
	timeline = new Timeline();

	$.getJSON('data/contents.json', function(data)
	{
		timeline.init(data);
	});
};