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

var init = function init(articles)
{
	var l = articles.length, i;

	for(i=0; i < l;i++)
	{
		articles[i].links.forEach(function(d)
		{
			if((/\.(jpeg|jpg|gif|png)$/).test(d.href))
			{
				articles[i].image = d.href;
			}
		});
	}

	return JSON.stringify(articles);
};


$.getJSON('data/paleoClean.json', function(data)
{
	console.log(init(data));
});
