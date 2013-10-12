document.ready = function()
{
    var timeline, articles, categories, init, preload, preloader, loaderAngle = 0,
    loadedTemplates = 0, templatesList, templates, imagesArticles = [],
    preloaderDom = $('#preload p:first-of-type'), timerStuck,
    loaded = false, loadedJs = [], assets = [
        'images/decade.png',
        'data/fonts/FF_DIN_Black.otf',
        'data/fonts/FF_DIN_Medium.otf',
        'data/fonts/FF_DIN_Regular.otf',
        'images/layout/bg/bg-full.jpg',
        'images/layout/bg/lines.png',
        'data/articles.json',
        'data/categories.json',
        "js/vendor/slimScroll.min.js",
        "js/vendor/jquery.jqdock.min.js",
        "js/vendor/TimelineMax.min.js",
        "js/vendor/TweenMax.min.js",
        "js/vendor/handlebars.min.js",
        "js/Utils.js",
        "js/ArticleViewer.js",
        "js/Timeline.js",
        'images/layout/pictos_fleche.png',
        'images/layout/picto_separe_champs.png',
        'images/favicon.png',
        'images/dropdown/matt.jpg',
        'images/dropdown/fb.png',
        'images/dropdown/rss.png',
        'images/dropdown/gplus.png',
        'images/dropdown/tw.png',
        'images/categories/picto_paleofuture_Cities.png',
        'images/categories/picto_paleofuture_Commerce.png',
        'images/categories/picto_paleofuture_Computers.png',
        'images/categories/picto_paleofuture_Disney.png',
        'images/categories/picto_paleofuture_Energy.png',
        'images/categories/picto_paleofuture_Events.png',
        'images/categories/picto_paleofuture_Fair.png',
        'images/categories/picto_paleofuture_Fashion.png',
        'images/categories/picto_paleofuture_Food.png',
        'images/categories/picto_paleofuture_Health.png',
        'images/categories/picto_paleofuture_Home.png',
        'images/categories/picto_paleofuture_Media.png',
        'images/categories/picto_paleofuture_People.png',
        'images/categories/picto_paleofuture_Robotics.png',
        'images/categories/picto_paleofuture_Space.png',
        'images/categories/picto_paleofuture_Sport.png',
        'images/categories/picto_paleofuture_Transports.png',
        'images/categories/picto_paleofuture_TV.png',
        'images/categories/picto_paleofuture_Weather.png',
        'images/layout/toolbar/picto_paleofuture_bloque.png',
        'images/layout/toolbar/picto_paleofuture_community.png',
        'images/layout/toolbar/picto_paleofuture_exclusif.png',
        'images/layout/toolbar/picto_paleofuture_pin.png',
        'images/layout/toolbar/picto_paleofuture_source.png',
        'images/layout/dents.png',
        'images/handle.png',
        'templates/ddMattNovak.hbs',
        'templates/ddPaleobox.hbs',
        'templates/ddCommunity.hbs',
        'templates/articleTimeline.hbs',
        'templates/articleView.hbs',
        'templates/categoriesList.hbs',
        'templates/decadeTimeline.hbs',
        'templates/timelineView.hbs',
        'templates/pinterest.hbs',
        'images/layout/placeholder.png',
        'images/layout/header/search.png',
        'images/layout/header/arrow.png',
        'images/layout/header/circle.png',
        'images/layout/header/clouds.png',
        'images/layout/header/logo.png',
        "images/articles/1870-3.jpg",
        "images/articles/1880-3.jpg",
        "images/articles/1890-4.jpg",
        "images/articles/1900-4.jpg",
        "images/articles/1910-3.jpg",
        "images/articles/1920-4.jpg",
        "images/articles/1930-4.jpg",
        "images/articles/1940-3.jpg",
        "images/articles/1950-3.jpg",
        "images/articles/1960-4.jpg",
        "images/articles/1970-3.jpg",
        "images/articles/1980-4.jpg",
        "images/articles/1990-3.jpg",
        "images/fake/avatar.png",
        "images/fake/future.jpg",
        "images/fake/crazy.jpg",
        "images/fake/world.jpg",
        "images/fake/grandma.jpg",
        "images/fake/techno.jpg",
        "images/fake/cars.jpg"
    ];

    templatesList = Constants.templates.templatesList;
    templates = Constants.templates.templates;

    preload = function()
    {
        preloader = new createjs.LoadQueue();
        preloader.maintainScriptOrder = true;
        preloader.addEventListener("fileload", handleFileLoad);
        // preloader.onFileLoad = handleFileLoad;
        preloader.addEventListener("progress", handleOverallProgress);
        // preloader.onProgress = handleOverallProgress;
        preloader.addEventListener("fileprogress", handleFileProgress);
        // preloader.onFileProgress = handleFileProgress;
        preloader.addEventListener("error", handleFileError);
        // preloader.onError = handleFileError;
        preloader.setMaxConnections(5);
        preloader.loadManifest(assets);
    };

    // preload handlers
    var handleFileLoad = function(event) {
        // console.log(event);
        var templateName = event.item.id.split(/\/|\./),
            isJavascript = event.item.id.split(/(js\/)/);
        if(templateName[2] == "hbs")
        {
            templates[templateName[1]] = Handlebars.compile(event.result);
        }
        else if(isJavascript[1] == "js/")
        {
            if(_.indexOf(loadedJs, event.result) == -1)
            {
                loadedJs.push(event.result);
                document.body.appendChild(event.result);
            }
        }
        /*else if(event.id == "images/layout/bg/bg-full.jpg")
        {
            $('html').css('background-image', 'url(../images/layout/bg/lines.png), url(../images/layout/bg/bg-full.jpg)');
        }*/
    };

    var handleFileProgress= function(event) {
    };
    var handleFileError = function(event) {
        console.log('fileError', event);
    };

    var handleOverallProgress = function(event) {
        var percent = event.loaded * 100;
        preloaderDom.text(percent.toFixed());
        preloaderDom.next().css('-webkit-transform', 'rotate(' + percent * 3.3 + 'deg)');
        //preloaderDom.prev().css('-webkit-filter', 'grayscale(' +  (1 - event.loaded.toFixed(2)) + ')');
        $('html').css('-webkit-filter', 'grayscale(' +  (1 - event.loaded.toFixed(2)) + ')');

        if(event.loaded == 1 && !loaded)
        {
            loaded = true;

            // articles = JSON.parse(preloader.getResult('data/articles.json').result);
            articles = preloader.getResult('data/articles.json');
            // categories = JSON.parse(preloader.getResult('data/categories.json').result);
            categories = preloader.getResult('data/categories.json');

            var a, c, self = this;
            if(!articles || !categories)
            {
               $.getJSON('data/articles.json', function(data)
                {
                    articles = data;
                    $.getJSON('data/categories.json', function(data)
                    {
                        categories = data;
                        TweenMax.to(preloaderDom.parent(), 0.5, {css:{marginTop: -70, opacity:0, display:'none'}, delay:0.5, onComplete: init}, Expo.easeIn);
                    });
                });
            }
            else
            {
                TweenMax.to(preloaderDom.parent(), 0.5, {css:{marginTop: -70, opacity:0, display:'none'}, delay:0.5, onComplete: init}, Expo.easeIn);
            }

        }
    };

    init = function()
    {
        timeline = new Timeline(articles, categories);
    };


    preload();
};