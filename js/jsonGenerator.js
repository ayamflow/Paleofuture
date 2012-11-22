var cat = [
	"Cities",
	"Commerce",
	"Computers",
	"Disney",
	"Energy",
	"Fashion",
	"Food",
	"Health",
	"Home",
	"Issues and Events",
	"Media",
	"People",
	"Robotics",
	"Space",
	"Sport",
	"Transportation",
	"Weather",
	"World's Fair"
],
l = cat.length,
articles;

var init = function init(data)
{
	var length = data.length;

	for(var i = 0; i < length; i++)
	{
		data[i].views = ~~(Math.random() * (9999 - 1000) + 1000);
	}
	return JSON.stringify(data);
};


$.getJSON('data/articlesClean.json', function(data)
{
	console.log(init(data));
});