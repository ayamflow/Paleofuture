var Utils = {
    getArticleFromTitle : function(title, articles)
    {
        var article, length = articles.length, current;

        for(var i = 0; i < length; i++)
        {
            current = articles[i];
            if(current.title == title)
            {
                article = current;
            }
        }
        return article;
    }
};