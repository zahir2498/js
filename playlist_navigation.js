(function (window, $){
	"use strict"	
	var MVPPlaylistNavigation = function(settings){

		var self = this,
		isMobile = MVPUtils.isMobile(),
		hasTouch = "ontouchstart" in window,
		parent = settings.parent,
		wrapper = settings.wrapper,

		playlistHolder = settings.playlistHolder,
		playlistInner = settings.playlistInner,
		playlistContent = settings.playlistContent,
		navBackward = wrapper.find('.mvp-nav-backward'),
		navForward = wrapper.find('.mvp-nav-forward'),

		playlistContentSize,
		navigationDirection = settings.navigationDirection,
		navigationType = settings.navigationType,
		pi_size = settings.pi_size,

		//button navigation
		thumbScrollValue = settings.thumbScrollValue,
		scrollEnabled = true,
		scrollActive,
		thumbTransform,

		playlistScroll,
		playlistScrollCssExistCheckDone


		function checkIfCssExist(name){

			var exist

		    $.each($("head link"), function() {
		        if ($(this).attr("href").toLowerCase().indexOf(name.toLowerCase()) > -1){
		        	exist = true;
		            return false;
		        }
		    });

		    return exist;
		}

		function appendStyle(url){
		    var ele = document.createElement('link');
		    ele.setAttribute("type", "text/css");
		    ele.setAttribute("rel", "stylesheet");
		    ele.setAttribute("href", url);
		    $('head').append(ele);
		}

		this.checkPlaylistNavigation = function(){

			if(navigationType == 'scroll'){

				if(window.playlistScrollLoading){
					var interval = setInterval(function(){
						if(!window.playlistScrollLoading){
							clearInterval(interval);
							self.checkPlaylistNavigation();
							return;
						}
					},100);
					return;
				}

				if(settings.playlistScrollType == 'mcustomscrollbar'){

					if(!playlistScrollCssExistCheckDone && !checkIfCssExist('mcustomscrollbar')){

						if(!MVPUtils.relativePath(settings.mCustomScrollbar_css))var src = MVPUtils.qualifyURL(settings.sourcePath+settings.mCustomScrollbar_css);
						else var src = settings.mCustomScrollbar_css;

						appendStyle(src)

						playlistScrollCssExistCheckDone = true;
					}

					if(typeof mCustomScrollbar === 'undefined'){

						window.playlistScrollLoading = true;

						var script = document.createElement('script');
						script.type = 'text/javascript';
						if(!MVPUtils.relativePath(settings.mCustomScrollbar_js))var src = MVPUtils.qualifyURL(settings.sourcePath+settings.mCustomScrollbar_js);
						else var src = settings.mCustomScrollbar_js;
						script.src = src;
						script.onload = script.onreadystatechange = function() {
							if(!this.readyState || this.readyState == 'complete'){
								self.checkPlaylistNavigation();
								window.playlistScrollLoading = false;
							}
						};
						script.onerror = function(){
							alert("Error loading " + this.src);
						}
						var tag = document.getElementsByTagName('script')[0];
						tag.parentNode.insertBefore(script, tag);

						return;
					}

					var axis = navigationDirection == 'h' ? 'x' : 'y';

					playlistInner.mCustomScrollbar({
						axis:axis,
						theme:settings.playlistScrollTheme,
						scrollInertia:0,
						scrollButtons:{ enable: true },
						mouseWheel:{ 
						 	normalizeDelta: true,
						 	deltaFactor: 50,
						 	preventDefault: true
						},
						keyboard:{enable:false},
						advanced:{ autoExpandHorizontalScroll: true },
						callbacks:{
						    onOverflowYNone:function(){
						        playlistInner.find('.mCSB_container').addClass('mvp-mCSB_full');//hide scrollbar area if no scroll
						    }, 
						    onOverflowY:function(){
					            playlistInner.find('.mCSB_container').removeClass('mvp-mCSB_full');
					        },
						    onTotalScroll: function(){
						    	parent.totalScrollAction();
						    },
						    alwaysTriggerOffsets: false
						}
					});

				}else if(settings.playlistScrollType == 'perfect-scrollbar'){

					if(!playlistScrollCssExistCheckDone && !checkIfCssExist('perfect-scrollbar')){

						if(!MVPUtils.relativePath(settings.perfectScrollbar_css))var src = MVPUtils.qualifyURL(settings.sourcePath+settings.perfectScrollbar_css);
						else var src = settings.perfectScrollbar_css;

						appendStyle(src)

						playlistScrollCssExistCheckDone = true;

					}

					if(typeof PerfectScrollbar !== 'function'){

						window.playlistScrollLoading = true;

						var script = document.createElement('script');
						script.type = 'text/javascript';
						if(!MVPUtils.relativePath(settings.perfectScrollbar_js))var src = MVPUtils.qualifyURL(settings.sourcePath+settings.perfectScrollbar_js);
						else var src = settings.perfectScrollbar_js;
						script.src = src;
						script.onload = script.onreadystatechange = function() {
						    if(!this.readyState || this.readyState == 'complete'){
						      	self.checkPlaylistNavigation();
								window.playlistScrollLoading = false;
						    }
						};
						script.onerror = function(){
							alert("Error loading " + this.src);
						}
						var tag = document.getElementsByTagName('script')[0];
						tag.parentNode.insertBefore(script, tag);

					}else{

						playlistScroll = new PerfectScrollbar(playlistInner[0], {
						  	wheelSpeed: 2,
						 	wheelPropagation: true,
						  	minScrollbarLength: 100
						});

						var event = navigationDirection == 'h' ? 'ps-x-reach-end' : 'ps-y-reach-end'

						playlistInner[0].addEventListener(event, () => {
							parent.totalScrollAction();
						});

					}

				}

			}else if(navigationType == 'buttons'){

				// mouse wheel
				if(!isMobile){

					playlistInner.on('wheel', function(e){

						if(!parent.getSetupDone() || parent.isPlaylistLoading()) return false;
						if(!scrollEnabled) return false;

						if(navigationDirection == 'h'){
							var s = playlistInner.width(), playlistContentSize = playlistContent.width(),
							prop = 'translateX';
						}else{
							var s = playlistInner.height(), playlistContentSize = playlistContent.height(),
							prop = 'translateY';
						}	

						if(playlistContentSize < s)return;//if centered

						navBackward.show();
						navForward.show();

						if(e.originalEvent.wheelDelta){
							var d = e.originalEvent.wheelDelta > 0 ? 1 : -1, value;
						}else if(e.originalEvent.detail){
							var d = e.originalEvent.detail < 0 ? 1 : -1, value;
						}

						if(!thumbTransform){
							value = playlistContent[0].style.transform.replace(/[^\d.]/g, '');
							value = parseInt(value) || 0;
						}else{
							value = thumbTransform;	
						}

						value += thumbScrollValue * d;
						if(value > 0){
							value = 0;	
							navBackward.hide();
						}else if(value <= s - playlistContentSize){
							value = s - playlistContentSize;	
							navForward.hide();

							parent.totalScrollAction();
						}
						
						thumbTransform = value;

						playlistContent.css({
							'-webkit-transform':''+prop+'('+value+'px)',
						    '-ms-transform':''+prop+'('+value+'px)',
						    'transform':''+prop+'('+value+'px)'
						});
						
						return false;
					});
				}

				//scroll on click event
				navBackward.on('click', function(){
					if(!parent.getSetupDone() || parent.isPlaylistLoading()) return false;
					if(scrollActive)return false;
					scrollActive = true;

					if(navigationDirection == 'h'){
						var s = playlistInner.width(), playlistContentSize = playlistContent.width(),
						prop = 'translateX';
					}else{
						var s = playlistInner.height(), playlistContentSize = playlistContent.height(),
						prop = 'translateY';
					}		

					if(playlistContentSize < s)return;//if centered

					navBackward.show();
					navForward.show();

					var value;
					
					if(!thumbTransform){
						value = playlistContent[0].style.transform.replace(/[^\d.]/g, '');
						value = parseInt(value) || 0;
					}else{
						value = thumbTransform;	
					}

					if(value % pi_size != 0){//check if thumb scroll lost boundaries (scroll to nearest thumb)

						var amount = -(value % pi_size);
						while (amount <= s - pi_size*2) {
						    amount += pi_size;
						}
						value += amount;

					}else{
						var scrollAmount = Math.floor(s / pi_size);
						value = value + (pi_size * scrollAmount);
					}
					
					if(value >= 0){
						value = 0;	
						navBackward.hide();
					}

					thumbTransform = value;	

					playlistContent.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
						scrollActive = false;
					}).css({
						'-webkit-transform':''+prop+'('+value+'px)',
					    '-ms-transform':''+prop+'('+value+'px)',
					    'transform':''+prop+'('+value+'px)'
					});
					
				});

				navForward.on('click', function(){
					if(!parent.getSetupDone() || parent.isPlaylistLoading()) return false;
					if(scrollActive)return false;
					scrollActive = true;

					if(navigationDirection == 'h'){
						var s = playlistInner.width(), playlistContentSize = playlistContent.width(),
						prop = 'translateX';
					}else{
						var s = playlistInner.height(), playlistContentSize = playlistContent.height(),
						prop = 'translateY';
					}		

					if(playlistContentSize < s)return;//if centered

					navBackward.show();
					navForward.show();

					var value;
					
					if(!thumbTransform){
						value = playlistContent[0].style.transform.replace(/[^\d.]/g, '');
						value = parseInt(value) || 0;
					}else{
						value = thumbTransform;	
					}

					if(value % pi_size != 0){//check if thumb scroll lost boundaries (scroll to nearest thumb)

						var amount = (value % pi_size) + pi_size;
						while (amount <= s - pi_size) {
						    amount += pi_size;
						}
						value -= amount;

					}else{
						var scrollAmount = Math.floor(s / pi_size);
						value = value - (pi_size * scrollAmount);
					}
					
					if(value <= s - playlistContentSize){
						value = s - playlistContentSize;	
						navForward.hide();

						parent.totalScrollAction();

					}

					thumbTransform = value;	

					playlistContent.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
						scrollActive = false;
					}).css({
						'-webkit-transform':''+prop+'('+value+'px)',
					    '-ms-transform':''+prop+'('+value+'px)',
					    'transform':''+prop+'('+value+'px)'
					});

				});	

				//touch
				if(hasTouch)initTouchNavigation();
				
			}else if(navigationType == 'hover'){
				//NOTE: hover navigation has no loadMoreOnTotalScroll because it doesnt make sense

				if(!isMobile){
					playlistInner.on("mousemove", function(e){
						if(!parent.getSetupDone() || parent.isPlaylistLoading()) return false;
						if(!scrollEnabled)return false;

						var value, z;

						if(navigationDirection == 'h'){

							var w = playlistHolder.width(), playlistContentSize = playlistContent.width();
							if(playlistContentSize < w) return;//if centered

							z = parseInt(playlistInner.css('left'),10) + playlistHolder.offset().left;
							value = (w - playlistContentSize)/w * (e.pageX - z);

							playlistContent.css('left', value+'px');

						}else{
							
							var h = playlistHolder.height(), playlistContentSize = playlistContent.height();
							if(playlistContentSize < h) return;//if centered

							z = parseInt(playlistInner.css('top'),10) + playlistHolder.offset().top;
							value = (h - playlistContentSize)/h * (e.pageY - z);

							playlistContent.css('top', value+'px');

						}
						
						return false;

					});
				}

				//touch
				if(hasTouch)initTouchNavigation();

			}

		}

		this.updatePosition = function(){//after using search in playlist

			if(settings.playlistScrollType == 'mcustomscrollbar'){

				playlistInner.mCustomScrollbar("scrollTo", 0);

			}else if(settings.playlistScrollType == 'perfect-scrollbar'){

				playlistInner[0].scrollTop = 0;
				//playlistScroll.update() // optional
			}

		}

		function initTouchNavigation(){

			var startX,
				startY,
				touchStartX,
				touchStartY,
				moved,
				moving = false;

			playlistContent.off('touchstart.ap touchmove.ap touchend.ap click.ap-touchclick').on(
				'touchstart.ap',
				function(e){
					if(!parent.getSetupDone() || parent.isPlaylistLoading()) return false;

					var touch = e.originalEvent.touches[0];
					startX = playlistContent.position().left;
					startY = playlistContent.position().top;
					touchStartX = touch.pageX;
					touchStartY = touch.pageY;
					moved = false;
					moving = true;
				}
			).on(
				'touchmove.ap',
				function(ev){
					if(!moving){
						return;
					}
					var touchPos = ev.originalEvent.touches[0];

					navBackward.show();
					navForward.show();

					if(navigationDirection == 'h'){

						var value = startX - touchStartX + touchPos.pageX, 
						w = playlistHolder.width(), playlistContentSize = playlistContent.width();
						if(playlistContentSize < w) return;//if centered

						if(value > 0){
							value = 0;	
							navBackward.hide();
						}else if(value <= w - playlistContentSize){
							value = w - playlistContentSize;
							navForward.hide();	

							if(loadMoreOnTotalScroll){
								if(nextPageToken && loadMoreType){
						    		if(!playlistTransitionOn){
						    			self.loadMore();
									}
						    	}
						    }else if(addMoreOnTotalScroll){
								if(!loadMoreProcess){
									addMore();
								}
							}

						}
						playlistContent.css('left',value+'px');

					}else{

						var value = startY - touchStartY + touchPos.pageY, 
						h = playlistHolder.height(), playlistContentSize = playlistContent.height();
						if(playlistContentSize < h) return;//if centered

						if(value > 0){
							value = 0;	
							navBackward.hide();
						}else if(value <= h - playlistContentSize){
							value = h - playlistContentSize;	
							navForward.hide();

							parent.totalScrollAction();

						}
						playlistContent.css('top',value+'px');

					}
					moved = moved || Math.abs(touchStartX - touchPos.pageX) > 5 || Math.abs(touchStartY - touchPos.pageY) > 5;
					
					return false;
				}
			).on(
				'touchend.ap',
				function(e){
					moving = false;
				}
			).on(
				'click.ap-touchclick',
				function(e){
					if(moved) {
						moved = false;
						return false;
					}
				}
			);

		}

		this.scrollTo = function(activePlaylistItem){

			if(navigationType == 'scroll'){

				if(settings.playlistScrollType == 'mcustomscrollbar'){

					if(typeof mCustomScrollbar !== 'undefined'){
						setTimeout(function(){
							if(navigationDirection == 'h'){
								playlistInner.mCustomScrollbar("scrollTo",parseInt(activePlaylistItem.position().left),{scrollInertia:500});
							}else{
								playlistInner.mCustomScrollbar("scrollTo",parseInt(activePlaylistItem.position().top),{scrollInertia:500});
							}
						},500);//wait a little to be sure player is resized
					}else{
						var interval = setInterval(function(){//on start if we wait for mCustomScrollbar to load
							if(typeof mCustomScrollbar !== 'undefined'){
								clearInterval(interval);
								
								if(navigationDirection == 'h'){
									playlistInner.mCustomScrollbar("scrollTo",parseInt(activePlaylistItem.position().left),{scrollInertia:500});
								}else{
									playlistInner.mCustomScrollbar("scrollTo",parseInt(activePlaylistItem.position().top),{scrollInertia:500});
								}
							}
						},500);	
					}

				}else if(settings.playlistScrollType == 'perfect-scrollbar'){
						
					setTimeout(function(){
						if(navigationDirection == 'h'){
							playlistInner.stop().animate({'scrollTop': activePlaylistItem[0].offsetLeft+'px'},{duration: 500});
						}else{
							playlistInner.stop().animate({'scrollTop': activePlaylistItem[0].offsetTop+'px'},{duration: 500});
						}
					},1000);

				}
					
			}else if(navigationType == 'buttons'){
				
				//we dont check scrollActive here

				if(navigationDirection == 'h'){
					var s = playlistHolder.width(), playlistContentSize = playlistContent.width(),
					prop = 'translateX';
				}else{
					var s = playlistHolder.height(), playlistContentSize = playlistContent.height(),
					prop = 'translateY';
				}		

				if(playlistContentSize < s)return;//if centered

				navBackward.show();
				navForward.show();

				var index = playlistContent.find('.mvp-playlist-item').index(activePlaylistItem);
				var value = - index * pi_size;
				
				if(value >= 0){
					value = 0;	
					navBackward.hide();
				}
				else if(value <= s - playlistContentSize){
					value = s - playlistContentSize;	
					navForward.hide();
				}

				thumbTransform = value;	

				playlistContent.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
					scrollActive = false;
				}).css({
					'-webkit-transform':''+prop+'('+value+'px)',
				    '-ms-transform':''+prop+'('+value+'px)',
				    'transform':''+prop+'('+value+'px)'
				});
			}

		}

        this.showButtons = function(type){
        	if(type == 'forward'){
				navForward.show();	
        	}
		}	

		this.resize = function(activePlaylistItem){

			if(navigationType == 'buttons'){

				if(navigationDirection == 'h'){
					var s = playlistInner.width(), playlistContentSize = playlistContent.width(),
					prop = 'translateX';
				}else{
					var s = playlistInner.height(), playlistContentSize = playlistContent.height(),
					prop = 'translateY';
				}

				console.log(s,playlistContentSize)
				
				if(playlistContentSize < s){
					scrollEnabled = false;

					navBackward.hide();
					navForward.hide();

					//var value = parseInt(s / 2 - playlistContentSize / 2,10);//center content

				}else{
					scrollEnabled = true;

					if(activePlaylistItem){
						var index = playlistContent.find('.mvp-playlist-item').index(activePlaylistItem),
						value = - index * pi_size;
					}else{
						var value = 0;
					}
					
					if(!thumbTransform){
						value = playlistContent[0].style.transform.replace(/[^\d.]/g, '');
						value = parseInt(value);
					}else{
						value = thumbTransform;	
					}

					//on resize dont loose container edges
					if(value > 0){
						value = 0;	
						navForward.show();
					}else if(value < s - playlistContentSize){
						value = s - playlistContentSize;	
						navBackward.show();
					}else if(isNaN(value) && !parent.getMediaType()){//no active item on start
						navForward.show();
					}
				
				

					thumbTransform = value;	

					setTimeout(function(){
						playlistContent.css({
							'-webkit-transform':''+prop+'('+value+'px)',
						    '-ms-transform':''+prop+'('+value+'px)',
						    'transform':''+prop+'('+value+'px)'
						});
					},350);//delay because of display none

				}
				
			}
			else if(navigationType == 'hover'){

				if(navigationDirection == 'h'){

					var w = playlistInner.width(), playlistContentSize = playlistContent.width();
					if(playlistContentSize < w){
						scrollEnabled = false;

						/*var value = parseInt(w / 2 - playlistContentSize / 2,10);//center content
						playlistContent.css('left', value+'px');//center*/

					}else{
						scrollEnabled = true;

						//on resize dont loose container edges
						var value = parseInt(playlistContent.css('left'),10);
						if(value > 0){
							value = 0;	
						}else if(value < w - playlistContentSize){
							value = w - playlistContentSize;	
						}
						playlistContent.css('left', value+'px');

					}

				}else{

					var h = playlistInner.height(), playlistContentSize = playlistContent.height();
					if(playlistContentSize < h){
						scrollEnabled = false;

						/*var value = parseInt(h / 2 - playlistContentSize / 2,10);//center content
						playlistContent.css('top', value+'px');//center*/

					}else{
						scrollEnabled = true;

						var value = parseInt(playlistContent.css('top'),10);
						if(value > 0){
							value = 0;	
						}else if(value < h - playlistContentSize){
							value = h - playlistContentSize;	
						}
						playlistContent.css('top', value+'px');
					}
				}

			}

		}

		this.setScrollActive = function(){
			scrollActive = false;
		}

		this.updateScrollPosition = function(){
			if(settings.playlistScrollType == 'perfect-scrollbar')if(playlistScroll)playlistScroll.update()
		}

		this.destroy = function(){

	        if(navigationType == 'scroll'){

	        	if(settings.playlistScrollType == 'mcustomscrollbar'){

					if(typeof mCustomScrollbar !== 'undefined')playlistInner.mCustomScrollbar('destroy');

				}else if(settings.playlistScrollType == 'perfect-scrollbar'){

					if(playlistScroll){
						playlistScroll.destroy();
						playlistScroll = null; 
					}
				}

	        }else if(navigationType == 'buttons'){

	        	playlistInner.off('wheel');
	            navBackward.off('click');
	            navForward.off('click');

	            if(navigationDirection == 'h'){
	                var prop = 'translateX';
	            }else{
	                var prop = 'translateY';
	            }   

	            var value = 0;

	            thumbTransform = value;

	            playlistContent.css({
	                '-webkit-transform':''+prop+'('+value+'px)',
	                '-ms-transform':''+prop+'('+value+'px)',
	                'transform':''+prop+'('+value+'px)'
	            });

	        }else if(navigationType == 'hover'){

	            playlistInner.off("mousemove");

	        }

	        if(hasTouch)playlistContent.off('touchstart.ap touchmove.ap touchend.ap click.ap-touchclick');

	        if(navigationDirection == 'h'){
	            playlistContent.css('left',0);
	        }else{
	            playlistContent.css('top',0);
	        }

	    }

	    self.checkPlaylistNavigation();

	};	

	window.MVPPlaylistNavigation = MVPPlaylistNavigation;

}(window,jQuery));