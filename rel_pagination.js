(function (window, $){
	"use strict"
	var MVPRelPagination = function (data){

	//############################################//
	/* settings */
	//############################################//

	var self = this,
	parent = data.parent,
	isMobile = MVPUtils.isMobile(),

	paginationInit,//first pagination init 
	paginationReady,//prevent resize
	contLen,//slide containers
	contRealLen,
	contSize,//cont width or height for slide animation (depending on navigationDirection)
	slideCounter = 0,
	slideValue,
	lastColumn,//remember when to recreate pagination after resize event
	lastRow,
	navigationDirection = 'h',
	column,
	row,
	gutter,//margins between boxes
	navigationDisabled = true,
	boxCount,
	playlistDataArr = [],
	playlistLength,
	lastVisibleBoxId,
	inited,
	fadeArr = [],

	breakPointArr = [
		{width:0, column:1, row:1, gutter:0},
        {width:450, column:2, row:2, gutter:10},
        {width:780, column:2, row:2, gutter:20},
        {width:1100, column:3, row:2, gutter:20},
    ],
    boxRatio = 16/9,
    shuffleOnOpen = true//shuffle rel boxes before open

	


	//############################################//
	/* setup */
	//############################################//


	var wrapper = data.wrapper,
	playlistHolder = wrapper.find('.mvp-rel-playlist-holder'),
	playlistInner = wrapper.find('.mvp-rel-playlist-inner'),
	playlistContent = wrapper.find('.mvp-rel-playlist-content')

	

	MVPUtils.keysrt(breakPointArr, 'width');//sort from low to high


	
	if(navigationDirection == 'h'){
		var prop = 'translateX';
	}else{
		var prop = 'translateY';
	}	


	//get playlist

	var pl_items = [];

	$(data.settings.playlistList).find('.mvp-rel-playlist').each(function(){
		var playlist = $(this),
		rel_num = playlist.attr('data-rel-num'),
		len = playlist.find('.mvp-playlist-item').length,
		playlist_id = playlist.attr('data-playlist-id');
	
		//get random x items

		var arr = [];
		while(arr.length < rel_num){
		    var r = Math.floor(Math.random() * len);
		    if(arr.indexOf(r) === -1){//not repeat
		    	arr.push(r);
		    	pl_items.push(playlist.find('.mvp-playlist-item').eq(r).attr('data-playlist-id', playlist_id));
		    }
		}

	});

	//build rel playlist

	playlistDataArr = [];

	var i, len = pl_items.length, str, item, hover_class = isMobile ? ' mvp-rel-box-mobile' : '', imgsrc, title, duration;
	
	for(i=0;i<len;i++){

		item = pl_items[i];

		imgsrc = item.attr('data-thumb') || item.attr('data-poster');
		title = item.attr('data-title');
		duration = item.attr('data-duration');

		str = '<div class="mvp-rel-box'+hover_class+'" data-id="'+i+'" data-playlist-id="'+item.attr('data-playlist-id')+'" data-media-id="'+item.attr('data-media-id')+'"';
					if(title)str += ' title="'+title+'"';
					str += '>'+ 
                    '<div class="mvp-rel-thumb">'+
                    	'<img class="mvp-rel-thumbimg" src="'+imgsrc+'" alt="image" />'+ 
                    '</div>';
                    if(title)str += '<div class="mvp-rel-title">'+title+'</div>';
                    if(duration)str += '<div class="mvp-rel-duration">'+MVPUtils.formatTime(duration)+'</div>';
                str += '</div>';

        playlistDataArr.push($(str));

	}

	playlistLength = playlistDataArr.length;




	//previous, next buttons

	var prev = wrapper.find('.mvp-rel-prev').on('click',function(){

		if(navigationDisabled)return false;
		navigationDisabled = true;

		//get slide counter
		slideCounter--;
		slideValue = - (slideCounter * contSize);

		executeSlide();

	});

	var next = wrapper.find('.mvp-rel-next').on('click',function(){

		if(navigationDisabled)return false;
		navigationDisabled = true;

		//get slide counter
		slideCounter++;
		slideValue = - (slideCounter * contSize);

		executeSlide();

	});

	wrapper.find('.mvp-rel-close').on('click',function(){

		if(navigationDisabled)return false;
		navigationDisabled = true;

		parent.toggleRel();

	});
	
	this.build = function(){

		if(inited)destroyPaginationContainer(true);

		if(shuffleOnOpen)MVPUtils.shuffleArray(playlistDataArr);

		//check columns on start
		getColumns();

		lastColumn = column;
		lastRow = row;

		buildPaginationContainer(true);

		fadeArr = [];

		if(!inited){
			inited = true;
			
			var item;
			
			playlistContent.find('.mvp-rel-box').each(function(){

				//on click load playlist in player (check if clicked item is already loaded playlist, in which case load only video)
				item = $(this).on('click', function(){
					var playlist_id = $(this).attr('data-playlist-id'), media_id = $(this).attr('data-media-id');
					var lp = parent.loadPlaylist('.mvp-playlist-'+playlist_id, media_id);
					if(!lp)parent.loadMedia('id',media_id);//playlist already loaded, load just video
				});

				//fade thumbs
				fadeArr.push(item.find('.mvp-rel-thumbimg'));
				
			});

			var p=0, len = fadeArr.length, z;
			for(z=0;z<len;z++){
				setTimeout(function(){
				   clearTimeout(this);
				   fadeArr[p].addClass('mvp-visible');
				   p++;
				},50 + ( z * 50 ));
			}	

		}else{

			playlistContent.find('.mvp-rel-box').each(function(){
				fadeArr.push($(this).find('.mvp-rel-thumbimg'));
			});

			var p=0, len = fadeArr.length, z;
			for(z=0;z<len;z++){
				setTimeout(function(){
				   clearTimeout(this);
				   fadeArr[p].addClass('mvp-visible');
				   p++;
				},50 + ( z * 50 ));
			}	
		}

	}

	function getColumns(){

		var w = wrapper.width(), h = wrapper.height();//leave space for close btn
		//console.log(w,h)

		var i, len = breakPointArr.length, point, bdata;
		for(i=0;i<len;i++){
			point = breakPointArr[i];

			if(w > point.width){
				column = point.column;
				gutter = point.gutter;
				bdata = point;
				//console.log(point)
			}
		}

		var bw = w / column;//box width
		var bh = bw / boxRatio;//box suggested height

		//check how much box height fit in wrapper height
		var ah = Math.round(h / bh);

		if(ah > bdata.row)ah = bdata.row;//not bigger than suggested
		row = ah;
		if(row<1)row = 1;

		//console.log(column,row, bw, bh, gutter)

	}

	function buildPaginationContainer(){

		boxCount = column * row;

		var i, j, z = 0, len2;

		contLen = Math.ceil(playlistLength / boxCount);

		for(i = 0; i < contLen; i++){

			var cont = $('<div class="mvp-rel-cont"></div>');

			len2 = boxCount;
			if(z + len2 > playlistLength) len2 = playlistLength - z;
			z += len2;

			for(j = 0; j < len2; j++){

				var box = playlistDataArr.shift();
				
				if(gutter > 0){
					var perc = 100/column, m = gutter + gutter/column;
					box.css({marginRight: gutter+'px', marginBottom: gutter+'px', width: 'calc('+perc+'% - '+m+'px)'});
				}else{
					box.css({marginRight: gutter+'px', marginBottom: gutter+'px', width: 100/column+'%'});
				}

				cont.append(box);

			}

			playlistContent.append(cont);

		}

		contRealLen = contLen;

		if(playlistLength % boxCount != 0){
			//we have leftover boxes in last cont, do not allow scroll to this item
			contLen -= 1;
		}

		playlistInner.css({paddingTop: gutter+'px', paddingLeft: gutter+'px'});

		playlistContent.css('display','block');
		
		var w = playlistHolder.width();

		var i = 0;
		playlistContent.find('.mvp-rel-cont').each(function(){
			i++;
			$(this).width(w);
		});

		if(navigationDirection == 'h'){
			playlistContent.width(w * i);

			contSize = playlistContent.children('.mvp-rel-cont').eq(0).width();
		}else{
			contSize = playlistContent.children('.mvp-rel-cont').eq(0).height();
		}	

		var h = playlistContent.children('.mvp-rel-cont').eq(0).height();
		playlistInner.css('height', h + gutter);	

		paginationInit = true;	

		if(lastVisibleBoxId){//reposition to last visible box (approximately)

			var cont = playlistContent.find('.mvp-rel-box[data-id='+lastVisibleBoxId+']').parent();
			if(cont.find('.mvp-rel-box').length == boxCount){//if all boxes inside
				slideCounter = cont.index();
			}else{//if boxes in last missing, do not go to last item
				slideCounter = cont.index() - 1;
				if(slideCounter < 0) slideCounter = 0;
			}
			
			var value = - (slideCounter * contSize);
			playlistContent.css({
			    'transform':''+prop+'('+value+'px)'
			});

			lastVisibleBoxId = null;
		}


		if(slideCounter == 0){
			prev.hide();
		}else{
			prev.show();
		}

		if(slideCounter+1 == contRealLen){	
			next.hide();
		}else{
			next.show();
		}


		playlistContent.css('opacity',1);

		paginationReady = true;
		navigationDisabled = false;
		
	}

	function destroyPaginationContainer(reset_opacity){

		playlistDataArr = [];

		var item;

		playlistContent.css('display','none').find('.mvp-rel-box').each(function(){
			item = $(this);
			if(reset_opacity)item.find('.mvp-rel-thumbimg').removeClass('mvp-visible');
			playlistDataArr.push(item.detach());//save data with detach!
		})
		playlistContent.find('.mvp-rel-cont').remove();

		prev.hide();
		next.hide();

		if(reset_opacity){
			lastVisibleBoxId = null;
			slideCounter = 0;
			playlistContent.css({
			    'transform':''+prop+'('+0+'px)'
			});
		}

	}

	this.resizePagination = function(){

		if(!paginationReady)return;
		paginationReady = false;

		getColumns();

		//check columns

		if(column != lastColumn || row != lastRow){

			lastColumn = column;
			lastRow = row;

			lastVisibleBoxId = playlistContent.children('.mvp-rel-cont').eq(slideCounter).find('.mvp-rel-box').eq(0).attr('data-id');

			destroyPaginationContainer();
			
			buildPaginationContainer();

			return;

		}

		var w = playlistHolder.width();

		var i = 0;
		playlistContent.find('.mvp-rel-cont').each(function(){
			i++;
			$(this).width(w);
		});

		if(navigationDirection == 'h'){
			playlistContent.width(w * i);
			contSize = playlistContent.children('.mvp-rel-cont').eq(0).width();
		}else{
			contSize = playlistContent.children('.mvp-rel-cont').eq(0).height();
		}	

		var h = playlistContent.children().eq(slideCounter).height();
		playlistInner.css('height', h + gutter);	
	
		//reposition container
		var value = - (slideCounter * contSize);
		playlistContent.css({
		    'transform':''+prop+'('+value+'px)'
		});

		paginationReady = true;

	}

	function executeSlide(){
		//console.log('executeSlide')

		//execute slide
		playlistContent.one("transitionend", function(){ 
			navigationDisabled = false;
		}).css({
		    'transform':''+prop+'('+slideValue+'px)'
		});

		//playlist height
		var h = playlistContent.children('.mvp-rel-cont').eq(slideCounter).height();
		playlistInner.css('height', h + gutter);

		if(slideCounter == 0){
			prev.hide();
		}else{
			prev.show();
		}

		if(slideCounter+1 == contRealLen){	
			next.hide();
		}else{
			next.show();
		}

	}

	return this;

	}
		
	window.MVPRelPagination = MVPRelPagination;

}(window,jQuery));