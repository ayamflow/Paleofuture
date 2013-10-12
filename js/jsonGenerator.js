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
	var l = articles.length, i, article, image;

	for(i=0; i < l;i++)
	{
        article = articles[i];
        if(article && article.links)
        {
            for(var j = 0, k = article.links.length; j < k; j++)
            {
                image = article.links[j]['href'];
                if( (/\.(gif|jpg|jpeg|png)$/i).test(image) )
                {
                    article.bigImage = image;
                }
            }
        }
	}

    return JSON.stringify(articles);
};


$.getJSON('data/articles.json', function(data)
{
	console.log(init(data));
});
