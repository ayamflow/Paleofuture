var Timeline = function(data, categories)
{
    this.top = $('#top');
    this.bottom = $('#bottom');
    this.timeline = $('#timeline');
    this.overlay = $('#overlay');
    this.times = $('#articles-thumbs');
    this.decades = [];
    this.decadesOffset = [];
    this.articlesByDecade = [];
    this.wrapperHeight = 605;
    this.gapWidth = window.innerWidth * 1.5;
    this.baseWidth = this.gapWidth + 6;
    this.halfScreen = window.innerWidth>>1;
    this.allArticles = [];
    this.isOpen = false;
    this.timelineMaxDrag = 3100;
    this.isDropdown = false;
    this.destX = 0;
    this.cursorX = 0;
    this.minGrayscale = 0.75;
    this.isPinterest = false;
    this.init(data, categories);
};

Timeline.prototype.init = function(data, categories)
{
    this.articleViewer = new ArticleViewer(categories);
    this.categories = categories['long'];
    this.shortCategories = categories['short'];
    // Créer des balises <p/> autour des paragraphes des articles
    this.allArticles = this.htmlize(data);
    data.sort(this.sortByYear);
    // Renvoie un double tableau des articles classés par décennie
    this.articlesByDecade = this.getArticlesByDecade(data);
    // Renvoie un tableau des 3-4 articles les plus RECENTS de chaque décennie
    this.articles = this.getRecentArticles(this.articlesByDecade);
    this.titles = this.getArticlesTitles(this.articles);

    // Auto complete
    var self = this;
    $('#search').autocomplete({
        source: this.titles,
        appendTo: $('.results'),
        select: function(event, ui)
        {
            //console.log('select');
            var $target = self.times.find('h2:contains("' + ui.item.value + '")').parent().parent(),
                id = $target.index(), type = "category";
            self.clearGap(self.createGap, [id, $target, type]);
        },
        focus: function(event, ui)
        {
            var //$target = $(event.srcElement);
                $target =  $('.results').find('a:contains("'+ui.item.value+'")');
            //console.log(event);
            $('.results').find('li').css({
                'font-weight': 'normal',
                background : 'transparent'
            });
            if($target.parent().is('li'))
            {
                    $target.parent().css({
                    'font-weight': 'bolder',
                    background: 'rgba(0, 0, 0, 0.2)'
                });
            }
        },
        open: function(event, ui)
        {
            //console.log('open');
            if(self.isDropdown)
            {
              self.clearDropdown(true);
            }
            else
            {
                TweenMax.to($('#dd-overlay'), 0.4, {css:{opacity:1, display:'block'}}, Expo.easeOut);
            }
        },
        close: function(event, ui)
        {
            //console.log('close');
            if(!self.isDropdown)
            {
                TweenMax.to($('#dd-overlay'), 0.4, {css:{opacity:0, display:'none'}}, Expo.easeOut);
            }
        }
    });

    // Créée un documentFragment contenant les articles
    var fragment = this.renderArticles(this.articles);
    // Place un documentFragment d'articles sur la timeline
    this.dispatchArticles(fragment);
};

/*===============================*/
/*              EVENTS           */
/*===============================*/

Timeline.prototype.attachEvents = function()
{
    var self = this;
    $('header')
    .on('mouseenter', 'li[data-template]', function()
    {
        TweenMax.to($(this).find('p'), 0.2, {css:{opacity: 0.8, top:34}}, Expo.easeOut);
    })
    .on('mouseleave', 'li[data-template]', function()
    {
        TweenMax.to($(this).find('p'), 0.2, {css:{opacity: 1, top:37}}, Expo.easeOut);
    })
    .on('click', 'li[data-template]', function(event)
    {
        self.articleViewer.noWheel = true;
        var template = $(event.currentTarget).attr('data-template');
        var dd = Constants.templates.templates[template]();
        $('#dropdown').html(dd);
         TweenMax.to($('#dropdown').children().eq(1), 0, {css:{opacity:0}});
        TweenMax.to($('#dd-overlay'), 0.4, {css:{opacity:1, display:'block'}}, Expo.easeIn);
        if(!self.isDropdown)
        {
            self.isDropdown = true;
            TweenMax.to($('#dropdown').children().eq(1), 0, {css:{opacity:1}});
            TweenMax.fromTo($('#dropdown'), 0.4, {css:{top:-30, opacity:0}}, {css:{top:15, opacity:1, display:'block'}, delay: 0.3}, Expo.easeIn);
        }
        else
        {
            TweenMax.fromTo($('#dropdown').children().eq(1), 0.4, {css:{opacity:0}}, {css:{opacity:1}, delay: 0.1}, Expo.easeIn);
            $('header nav p').removeClass('selected');
        }
        $(event.currentTarget).find('p').addClass('selected');
    })
    .on('click', 'img', this.onHeaderClick.bind(this));
    $('#dropdown .ddClose').live('click', this.clearDropdown.bind(this));

    $('#dropdown input[type=submit]').live('click', this.showJourneyLog.bind(this));
    $('#article .closeArticle').live('click', this.clearGap.bind(this));
    this.attachDecadeEvents();
    this.attachArticleEvents();
    TweenMax.ticker.addEventListener("tick", this.parallaxUpdate, this);
    this.easeTimeline();
};

Timeline.prototype.detachEvents = function()
{
    $('#timeline ul').undelegate('li', 'click', this.onYearClick.bind(this));
    $('#container').undelegate('div.article', 'click', this.onArticleClick.bind(this));
    $(window).off('resize scroll mousemove');
    this.cursor.off('drag dragstart dragstop');
    this.detachDecadeEvents();
};

Timeline.prototype.clearDropdown = function(leaveOverlay)
{
    $('header nav p').removeClass('selected');
    this.isDropdown = false;
/*    $('header').find('li:not(:last-child)').each(function()
    {
        TweenMax.to($(this).find('.shadow'), 0.2, {css:{opacity: 0}}, Expo.easeOut);
        TweenMax.to($(this).find('.arrow'), 0.2, {css:{rotation: '0deg', left:4, top:0}}, Expo.easeIn);
    });*/
    if(!this.isOpen)
    {
        this.articleViewer.noWheel = false;
    }
    if(typeof leaveOverlay == "Boolean" || typeof leaveOverlay == "boolean")
    {
        if(leaveOverlay){}
        else
        {
            TweenMax.to($('#dd-overlay'), 0.4, {css:{opacity:0, display:'none'}}, Expo.easeOut);
        }
    }
    else if(typeof leaveOverlay == "object")
    {
        TweenMax.to($('#dd-overlay'), 0.4, {css:{opacity:0, display:'none'}}, Expo.easeOut);
    }
    TweenMax.to($('#dropdown'), 0.4, {css:{top:-30, opacity:0, display:'none'}}, Expo.easeOut);
};

Timeline.prototype.attachArticleEvents = function()
{
    this.cursor.on('drag', this.onTimelineDrag.bind(this));
    this.cursor.on('dragstart', this.onDragStart.bind(this));
    this.cursor.on('dragstop', this.onDragEnd.bind(this));
    $('#container').delegate('div.article', 'click', this.onArticleClick.bind(this));
    this.times.find('.article').hover(function()
    {
        TweenMax.to($(this).find('.infos'), 0.3, {css:{opacity: 1}}, Expo.easeOut);
    },
    function()
    {
        TweenMax.to($(this).find('.infos'), 0.2, {css:{opacity: 0}}, Expo.easeIn);
    });
    $(window)[0].addEventListener('mousewheel', this.onScroll.bind(this), false );
};

Timeline.prototype.detachArticleEvents = function()
{
    this.cursor.off('drag dragstart dragstop');
    $('#container').off('click');
    this.times.find('.article').off('mouseleave mouseenter');
};

Timeline.prototype.attachDecadeEvents = function()
{
    this.overlay.delegate('div.decade-title', 'mouseenter', this.onDecadeMouseOver.bind(this));
    this.overlay.delegate('div.decade-title', 'mouseleave', this.onDecadeMouseOut.bind(this));
    this.overlay.delegate('div.decade-title', 'click', this.onDecadeClick.bind(this));
};

Timeline.prototype.detachDecadeEvents = function()
{
    this.overlay.off('mouseenter mouseleave click');
};

Timeline.prototype.updateDragPosition = function(event)
{
    var minX = this.timeline.offset().left,
        maxX = this.timeline.offset().left + this.timeline.width() - this.cursor.width(),
        offsetX = event.clientX / window.innerWidth * this.timeline.width();

    if(event.clientX >=  minX && event.clientX <=  maxX)
    {
        this.cursor.css('left', offsetX);
    }
};

Timeline.prototype.onResize = function()
{
    this.gapWidth = window.innerWidth;
    this.baseWidth = this.gapWidth + 6;
    this.halfScreen = window.innerWidth>>1;
    //console.log('onresize', this.halfScreen);
};

Timeline.prototype.onScroll = function(event)
{
    if(!this.articleViewer.noWheel)
    {
        this.animateScroll(- (event.wheelDelta/120 * 10), false);
    }
};

Timeline.prototype.onDragStart = function(event, ui)
{
    TweenMax.to(this.timeline.find('.ten'), 0.4, {css:{opacity: 0.6}}, Expo.easeIn);
    TweenMax.to(this.timeline.find('.all'), 0.4, {css:{opacity: 0.4}}, Expo.easeIn);
    //$('html').css('cursor', 'none');
    //TweenMax.to(this.timeline.find('.handle'), 0, {css:{bottom: -8, fontSize: 37}}, Expo.easeIn);
};

Timeline.prototype.onDragEnd = function(event, ui)
{
    TweenMax.to(this.timeline.find('.ten'), 0.4, {css:{opacity: 1}}, Expo.easeIn);
    TweenMax.to(this.timeline.find('.all'), 0.4, {css:{opacity: 0.9}}, Expo.easeIn);
    //TweenMax.to(this.timeline.find('.handle'), 0.3, {css:{bottom: -15, fontSize: 24}}, Expo.easeIn);
    //$('html').css('cursor', 'auto');
};

Timeline.prototype.onTimelineDrag = function(event, ui)
{

    var articlesWidth = Math.max(this.topWidth, this.bottomWidth),// + parseInt(this.times.css('paddingLeft'), 10) + parseInt(this.times.css('paddingRight'), 10),
        timelineWidth = this.timeline.find('.dragBound').width() - this.timeline.find('.handle').width(),
        normalized = ui.position.left/timelineWidth,
        mapped = ~~(normalized * this.timelineMaxDrag);

    this.animateScroll(mapped, true);
};

Timeline.prototype.animateScroll = function(value, positionGap)
{
    if(this.isOpen)
    {
        this.clearGap();
        this.isOpen = false;
    }

    var to = value, year, norm, map, newGray;

    if(!positionGap)
    {
        value += this.times.scrollLeft();
    }
    if(value < 0)
    {
        value = 0;
    }
    if(value > this.timelineMaxDrag)
    {
        value = this.timelineMaxDrag;
    }

    norm = value / this.timelineMaxDrag;
    map = norm * (this.timeline.find('.dragBound').width() - this.cursor.width());
    year = ~~(1870 + norm * 120);
    if(year < 1870) year = 1870;
    if(year > 1990) year = 1990;

    this.destX = value;
    if(!positionGap)
    {
        this.stopTick();
        this.cursor.css('left', map);
        this.times.scrollLeft(value);
        //this.cursor.css('left', (this.destX / this.timelineMaxDrag) *  (this.timeline.find('.dragBound').width() - this.cursor.width()));
    }
    else
    {
        this.goTick();
    }
    this.cursor.find('.handle').text(year);
    newGray = (this.minGrayscale - norm).toFixed(2);
    if(newGray < 0) newGray = 0;
    if(newGray > this.minGrayscale) newGray = this.minGrayscale;
    $('html').css('-webkit-filter', 'grayscale(' + newGray  + ')');

    $('html').css('background-position', this.scrollEase(this.times[0].scrollLeft, 0.01, -1, 0.01) + "px 0px, " + this.scrollEase(this.times[0].scrollLeft, 0.2, -1, 0.6) + "px 0px");
};

Timeline.prototype.scrollEase = function(ref, speed, direction, coef)
{
    return direction * (ref + ((this.destX * coef) - ref) * speed);
};

Timeline.prototype.easeTimeline = function()
{
    this.times[0].scrollLeft = this.scrollEase(this.times[0].scrollLeft, 0.4, 1, 1);
};

Timeline.prototype.parallaxUpdate = function()
{
    this.timeline.find('.ten').offset({ left : 25 + this.timeline.find('.dragBound').offset().left - this.cursor.width()/2 + this.scrollEase(this.timeline.find('.ten').offset().left, 1, -1, 0.132)});
    this.timeline.find('.all').offset({ left : 40 + this.timeline.find('.dragBound').offset().left - this.cursor.width()/2 + this.scrollEase(this.timeline.find('.all').offset().left, 1, -1, 1.149)});

    $('.concentrics').offset({ left : window.innerWidth/2 + this.scrollEase( $('.concentrics').offset().left, 1, -1, 0.2)});
    $('html').css('background-position', this.scrollEase(this.times[0].scrollLeft, 0.1, -1, 4) + "px 0px, " + this.scrollEase(this.times[0].scrollLeft, 0.1, -1, 0.4) + "px 0px");
};

Timeline.prototype.goTick = function()
{
    this.stopTick();
    TweenMax.ticker.addEventListener("tick", this.easeTimeline, this);
};

Timeline.prototype.stopTick = function()
{
    TweenMax.ticker.removeEventListener("tick", this.easeTimeline);
};

Timeline.prototype.scrollTimeline = function(event)
{
    var scrollTo = $(event.target).attr('data-scroll');
    TweenMax.to(this.times, 1, {css:{scrollLeft: scrollTo}}, Quad.easeInOut);
};

Timeline.prototype.onDecadeClick = function(event)
{
    if(this.isOpen)
    {
        this.clearGap();
        this.isOpen = false;
    }

    var $target = $(event.currentTarget),
        id = $target.index();

    this.clearGap(this.createGap, [id, $target, "decade"]);
};

Timeline.prototype.onDecadeMouseOver = function(event)
{
    $(event.currentTarget).addClass('pointer');
    var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
        target = '.decade-' + year;
};

Timeline.prototype.onDecadeMouseOut = function(event)
{
    $(event.currentTarget).removeClass('pointer');
    var year = event.currentTarget.className.split(' ')[1].split('title-')[1],
        target = '.decade-' + year;
};

Timeline.prototype.onYearClick = function(event)
{
    this.articleViewer.clearArticleViewer();
    var $target = $(event.currentTarget),
        dest = parseInt($target.position().left, 10) + parseInt($target.css('marginRight'), 10) + parseInt($target.css('marginLeft'), 10),
        gray = this.minGrayscale - (dest/this.timeline.width());
    TweenMax.to(this.cursor, 1, {css:{left : dest}}, Expo.easeOut);
    // How to animate this ?
    $('html').css({
        '-webkit-filter' : 'grayscale(' + (gray.toFixed(2)) + ')'
    });
    this.clearGap(this.scrollTimeline, [event]);
};

Timeline.prototype.onArticleClick = function(event)
{
    this.articleViewer.clearArticleViewer();

    var $target = $(event.currentTarget),
        id = $target.index();
    this.clearGap(this.createGap, [id, $target, "category"]);
};

/*===============================*/
/*  AFFICHAGE DES FAKES (DEMO)   */
/*===============================*/
Timeline.prototype.showJourneyLog = function(event)
{
    if(this.isDropdown)
    {
        this.clearDropdown();
    }
    this.detachArticleEvents();
    this.stopTick();
    this.isPinterest = true;
    this.articleViewer.noWheel = true;
    var html = Constants.templates.templates.pinterest();
    $('.pinterest').html(html);
    $('html').css({
        '-webkit-filter' : 'grayscale(0)'
    });
    this.clearDropdown(false);
    var timelineJourney = new TimelineMax();
    timelineJourney.insert(TweenMax.to($('#article'), 1, {css:{opacity:0, zIndex:-200}}, Expo.easeIn), 0);
    timelineJourney.insert(TweenMax.to(this.times, 1, {css:{opacity:0, display: 'none'}}, Expo.easeIn), 0);
    timelineJourney.insert(TweenMax.to(this.timeline, 1, {css:{opacity:0, display: 'none'}}, Expo.easeIn), 0);
    timelineJourney.insert(TweenMax.to($('.pinterest'), 1, {css:{opacity:1, display: 'block'}}, Expo.easeIn), 0.8);
    timelineJourney.play();
};

Timeline.prototype.onHeaderClick = function(event)
{
    if(this.isDropdown)
    {
        this.clearDropdown();
    }
    if(this.isPinterest)
    {
        this.articleViewer.noWheel = false;
        this.detachArticleEvents();
        this.attachArticleEvents();
        this.goTick();
        var timelineJourney = new TimelineMax();
        timelineJourney.insert(TweenMax.to($('.pinterest'), 1, {css:{opacity:0, display:"none"}}, Expo.easeIn), 0);
        timelineJourney.insert(TweenMax.to(this.times, 1, {css:{opacity:1, display:"block"}}, Expo.easeIn), 0.8);
        timelineJourney.insert(TweenMax.to(this.timeline, 1, {css:{opacity:1, display:"block"}}, Expo.easeIn), 0.8);
        timelineJourney.play();
    }
};

/*===============================*/
/*      TIMELINE ANIMATION       */
/*===============================*/

Timeline.prototype.greyscale = function()
{
    $('html').css({
        '-webkit-filter' : 'grayscale(' + this.grey.value + ')'
    });
};

Timeline.prototype.showTimeline = function()
{
    $('#container').css({
        top : '50%',
        marginTop: -320
    });
    this.cursor.draggable({
        axis:"x",
        containment:"parent"
    });
    var self = this;
    this.grey = { value : 0};
    TweenMax.ticker.addEventListener("tick", this.greyscale, this);

    var timeline = new TimelineMax();
    timeline.insert(TweenMax.to(this.grey, 3, {value: this.minGrayscale}), 0);
    timeline.insert(TweenMax.to($('header'), 1.2, {css:{top:0, opacity:1}}, Expo.easeInOut), 0);
    timeline.insert(TweenMax.to(this.times, 1, {css:{opacity:1/*, paddingLeft : 600*/}}, Expo.easeInOut), 1);
    timeline.insert(TweenMax.from(this.top, 1, {css:{marginLeft : 0}}, Expo.easeInOut), 1);
    timeline.insert(TweenMax.from(this.bottom, 1, {css:{marginLeft : 0}}, Expo.easeInOut), 1);
    timeline.insert(TweenMax.from(this.overlay, 1, {css:{marginLeft : -200}, onComplete: function() {
        TweenMax.ticker.removeEventListener("tick", self.greyscale);
        self.times.width(window.innerWidth - self.times.offset().left);
        self.goTick();

        // "drag me" tooltip
        var tooltip = self.timeline.find('.tooltip'), ad = 1.5;
        var timelineTooltip = new TimelineMax();
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-25%', opacity:1}}, Expo.easeOut), ad/2);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-26%'}}, Expo.easeOut), ad);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-25%'}}, Expo.easeOut), ad*1.5);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-26%'}}, Expo.easeOut), ad*2);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-25%'}}, Expo.easeOut), ad*2.5);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-26%'}}, Expo.easeOut), ad*2.5);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-25%'}}, Expo.easeOut), ad*3);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-26%'}}, Expo.easeOut), ad*3.5);
        timelineTooltip.insert(TweenMax.to(tooltip, ad, {css:{marginLeft: '-25%', opacity:0, display:'none'}}, Expo.easeOut), ad*4);
        timelineTooltip.play();
    }}, Expo.easeInOut), 1);
    timeline.insert(TweenMax.to($('.concentrics'), 4, {css:{opacity : 0.2}, delay:0.5}, Expo.easeInOut), 2);
    timeline.play();
};

Timeline.prototype.clearGap = function(callback, params, pTime)
{
    this.goTick();
    this.articleViewer.clearArticleViewer();
    this.attachDecadeEvents();
    var timelineParams = callback && params ? {onComplete:callback.bind(this), onCompleteParams:params} : {},
        timelineInit = new TimelineMax(timelineParams),
        time = pTime || 0.5;

    this.overlay.children().each(function()
    {
        timelineInit.insert(TweenMax.to($(this), time, {css:{opacity:1}}, Expo.easeInOut), 0);
    });
    timelineInit.insert(TweenMax.to(this.overlay, time, {css:{top: '50%'}}, Expo.easeInOut), 0);
    this.top.children().each(function()
    {
        timelineInit.insert(TweenMax.to($(this), time, {css:{margin : 3}}, Expo.easeInOut), 0);
    });
    this.bottom.children().each(function()
    {
        timelineInit.insert(TweenMax.to($(this), time, {css:{margin : 3}}, Expo.easeInOut), 0);
    });
    timelineInit.play();
};

Timeline.prototype.createGap = function(id, $target, type)
{
    this.stopTick();
    var self = this;
    this.detachDecadeEvents();
    var $topDiv, $bottomDiv,
        topOffsetLeft, bottomOffsetLeft, ratio,
        year, targetYear,
        refTitle, refArticle, refOffset,
        timelineArticle,
        topDivOffset, bottomDivOffset, topDivWidth, bottomDivWidth,
        i;

    if(type == "category") // show selected article
    {
        refTitle = $target.find('h2').text();
        year = parseInt($target.attr('class').split(' ')[0].split('decade-')[1], 10);
        $topDiv = this.top.children().eq(id);
        $bottomDiv = this.bottom.children().eq(id);
        for(i = 0, articles = this.articlesByDecade['articles-' + year], l = articles.length; i < l; i++)
        {
            if(articles[i].title == refTitle)
            {
                refArticle = articles[i];
            }
        }
    }
    else if(type == "decade") // Show most popular article of decade
    {
        year = parseInt($target.find('h2').text(), 10);//.attr('data-decade'), 10);
        $topDiv = this.top.find('.decade-' + year).eq(0);
        $bottomDiv = this.bottom.find('.decade-' + year).eq(0);
        var articles = this.articlesByDecade['articles-' + year];
        refArticle = articles[0];
        for(i = 0, l = articles.length; i < l; i++)
        {
            if(refArticle.views < articles[i].views)
            {
                refArticle = articles[i];
            }
        }
    }

    if($topDiv.length === 0)
    {
        $topDiv = $target;
    }
    else if($bottomDiv.length === 0)
    {
        $bottomDiv = $target;
    }

    timelineArticle = new TimelineMax({onComplete:this.loadArticle.bind(this), onCompleteParams:[this.articles, refArticle, type]});
    self.overlay.children().each(function(i)
    {
        timelineArticle.insert(TweenMax.to($(this), 0.3, {css:{opacity:0}}, Expo.easeOut));
    });
    timelineArticle.insert(TweenMax.to(self.overlay, 1, {css:{top: '40%'}}, Expo.easeOut));
    timelineArticle.insert(TweenMax.to($topDiv, 1, {css:{marginRight: this.gapWidth}, delay:0.15}, Expo.easeIn));
    timelineArticle.insert(TweenMax.to($bottomDiv, 1, {css:{marginRight: this.gapWidth}, delay:0.15}, Expo.easeIn));
    timelineArticle.insert(TweenMax.to(this.times, 1, {scrollLeft : this.times.scrollLeft() + $target.offset().left + $target.width() + 200, delay:0.15}, Expo.easeIn));
    timelineArticle.gotoAndStop(0);
    this.isOpen = true;

    timelineArticle.play();
};

Timeline.prototype.createTimeline = function()
{
    var that = this,
        decadeTitles,
        timelineDecades,
        titlesFragment = $(document.createDocumentFragment()),
        years = [];

    for(var i = 0; i <= 120; i++)
    {
        years[i] = 1870 + i;
    }

    timelineDecades = Constants.templates.templates.timelineView({
        years : years,
        decades : this.decades
    });
    $(timelineDecades).appendTo(this.timeline);

    decadeTitles = Constants.templates.templates.decadeTimeline({
        decades : this.decades
    });
    $(decadeTitles).appendTo(titlesFragment);

    this.dispatchTitles(titlesFragment);

    $('#timeline ul.ten li').each(function(i)
    {
        var li = $(this);
        var year = li.text();
        var t = $('.title-' + year);
        li.attr({'data-scroll': t.offset().left - that.halfScreen/2 + t.width()/2 });
        if(i === 0)
        {
            li.attr({'data-scroll': 0});
        }
    });

    var liNumber, baseWidth, baseHeight;

    baseWidth = this.timeline.find('ul').children().eq(0).width() + (this.timeline.find('ul').children().eq(0).css('paddingLeft').replace('px', ''));
    baseHeight = this.timeline.find('ul').children().eq(0).height();
    liNumber = this.timeline.find('ul').children().length;
    this.timeline.find('ul').width(baseWidth * liNumber).height(baseHeight);

    this.cursor = this.timeline.find('.helper');
    this.attachEvents();
    this.showTimeline();
};

Timeline.prototype.loadArticle = function(articles, article, type)
{
    this.articleViewer.init(this.allArticles, article, type);
};

Timeline.prototype.setWidth = function(container, callback)
{
    var divs = container.children(),
        length = divs.length,
        finalWidth = this.baseWidth;
    for(var i = 0; i < length; i++)
    {
        finalWidth += divs[i].clientWidth + 6;
    }
    container.width(finalWidth);

    if(callback)
    {
        var done = false,
            wrapper = this.times,
            intervalCallback,
            self = this;

        intervalCallback = setInterval(function()
        {
            if(!done && wrapper.height() == self.wrapperHeight)
            {
                done = true;
                clearInterval(intervalCallback);
                callback();
            }
        }, 50);
    }
    return finalWidth;
};

/*===============================*/
/*          FORMATTING           */
/*===============================*/

Timeline.prototype.renderArticles = function(articles)
{
    var length = articles.length,
    articlesFragment = document.createDocumentFragment(),
    article, i;

    for(i = 0; i < length; i++)
    {
        article = articles[i];
        if(article)
        {
            this.formatArticle(article)
            .appendTo(articlesFragment);
        }
    }

    return articlesFragment;
};

Timeline.prototype.formatArticle = function(article)
{
    var shortCategoryIndex = _.indexOf(this.categories, article.category),
        articleDiv = Constants.templates.templates.articleTimeline({
        year: article.decade,
        image: article.image,
        title: article.title,
        category: this.shortCategories[shortCategoryIndex]
    });
    this.updateDecades(article.decade);
    return $(articleDiv);
};

Timeline.prototype.formatTitle = function(year)
{
    var titleDiv = Constants.templates.templates.decadeTimeline({
        year : year
    });
    return $(titleDiv);
};

Timeline.prototype.dispatchArticles = function(data)
{
    var topFragment = document.createDocumentFragment(),
        bottomFragment = document.createDocumentFragment(),
        articles = $.makeArray($(data)[0].childNodes),
        length = articles.length,
        currentArticle, $current, position;

    for(var i = 0; i < length; i++)
    {
        currentArticle = articles[i];
        $current = $(currentArticle);
        position = Constants.timeline.align[i];
        if(position)
        {
            topFragment.appendChild(currentArticle);
            $current.css({
                width: Constants.timeline.width[i],
                height: Constants.timeline.height[i],
                top: 300 - Constants.timeline.height[i]
            });
        }
        else
        {
            bottomFragment.appendChild(articles[i]);
            $current.css({
                width: Constants.timeline.width[i],
                height: Constants.timeline.height[i]
            });
        }
        $current.find('.infos').css({
            width: Constants.timeline.width[i],
            height: Constants.timeline.height[i]
        });
    }

    this.top.append(topFragment);
    this.bottom.append(bottomFragment);
    //$('.article').css('backgroundSize', 'cover');
    this.topWidth = this.setWidth(this.top);
    this.bottomWidth = this.setWidth(this.bottom, this.createTimeline.bind(this));
};

Timeline.prototype.dispatchTitles = function(data)
{
    var childs = [],
        length = data[0].childNodes.length,
        i,
        yearDiv,
        year,
        divArray = Constants.timeline.decadeOffset,
        labelTop,
        child;

    for(i = 0; i < length; i++)
    {
        child = data[0].childNodes[i];
       if(child.nodeType == 1)
        {
            childs.push(child);
        }
    }

    length = childs.length;

    for(i = 0; i < length; i++)
    {
        yearDiv = childs[i];
        year = yearDiv.childNodes[0].innerText;
        labelTop = i%2 === 0 ? -40 : 30;
        $(yearDiv).css('left', divArray[i] + $(yearDiv).width() + 75)
        .css('top', labelTop);
        this.decadesOffset.push(divArray[i] + $(yearDiv).width());
    }

    this.overlay.append(childs);
};

/*===============================*/
/*      GETTERS AND UTILITIES    */
/*===============================*/

Timeline.prototype.htmlize = function(data)
{
    //wrap carriage-returned text in a <p></p> tag
    var l = data.length;

    for(var i = 0; i < l; i++)
    {
        data[i].text = "<p>" + data[i].text.replace('\n\n', "</p><p>")
        .replace('\n', "</p><p>")//"<br />")
        .replace("</p><p>", "</p>" + '\n' + "<p>") + "</p>";
        data[i].text.replace('<p> </p>', '');
    }
    return data;
};

Timeline.prototype.getArticlesByDecade = function(articles)
{
    var length = articles.length,
        decades = [],
        article, year, i, id;

    for(i=0; i < length; i++)
    {
        article = articles[i];
        year = article.decade;
        id = 'articles-' + year;

        if(!decades[id])
        {
            decades[id] = [];
            decades[id].year = year;
        }
        decades[id].push(article);
    }
    return decades;
};

Timeline.prototype.getRecentArticles = function(decades)
{
    var length = decades.length,
        keys = Object.keys(decades),
        keysLength = keys.length,
        articles,
        article,
        recentArticles = [],
        tempArticles,
        iterator;
        keys.sort(this.sortDecadeKeys);
    for(var i = 0; i < keysLength; i++)
    {
        articles = decades[keys[i]];
        if(articles)
        {
            articles.sort(this.sortByDate);
            for(var j = 0, k = Constants.timeline.count[i]; j < k; j++)
            {
                recentArticles.push(articles[j]);
            }
        }
    }
    return recentArticles;
};

Timeline.prototype.getPopularArticles = function(decades)
{
    var length = decades.length,
        keys = Object.keys(decades),
        keysLength = keys.length,
        articles,
        article,
        popularArticles = [],
        tempArticles,
        iterator;
        keys.sort(this.sortDecadeKeys);
    for(var i = 0; i < keysLength; i++)
    {
        articles = decades[keys[i]];
        if(articles)
        {
            articles.sort(this.sortByViews);
            for(var j = 0, k = Constants.timeline.count[i]; j < k; j++)
            {
                popularArticles.push(articles[j]);
            }
        }
    }
    return popularArticles;
};

Timeline.prototype.updateDecades = function(year)
{
    if(_.indexOf(this.decades, year) === -1)
    {
        this.decades.push(year);
    }
};

Timeline.prototype.getArticlesTitles = function(articles)
{
    var titles = [];

    for(var i = 0, l = articles.length; i < l; i ++)
    {
        titles.push(articles[i].title);
    }

    return titles;
};

Timeline.prototype.sortByDate = function(b, a)
{
    return new Date(a.date.y, a.date.m, a.date.d) - new Date(b.date.y, b.date.m, b.date.d);
};

Timeline.prototype.sortByViews = function(a, b)
{
    return a.views - b.views;
};

Timeline.prototype.sortByYear = function(a, b)
{
    return a.year - b.year;
};

Timeline.prototype.sortDecadeKeys = function(a, b)
{
    return a.split('articles-')[1] - b.split('articles-')[1];
};

Timeline.prototype.sortByDecade = function(a, b)
{
    return a - b;
};