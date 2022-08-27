(function (window, $){
	"use strict"	
	var MVPAudioEqualizer = function (data){

		var self = this,
		renderVizualitationID,
		context,
		canvas = data.canvas,
		ctx = canvas.getContext("2d"),
		holder = data.holder,
		analyser,
		center_x, 
		center_y, 
		radius, 
		bars, 
		x,
		y,
		x_end, 
		y_end, 
		bar_height, 
		bar_width = 2,
		frequency_array,
		rads,
		source,
		multiplier = 0.7,
		context_ready;
		
		this.resume = function(){
			if (context.state === 'suspended' && typeof context.resume === 'function') {
			    context.resume()
			}
  			//https://bugs.chromium.org/p/chromium/issues/detail?id=419446
  			//https://bugs.webkit.org/show_bug.cgi?id=125031
		}
		
	    this.init = function(audio){

	    	if(!context_ready){

	    		context = new (window.AudioContext || window.webkitAudioContext)();

			    analyser = context.createAnalyser();
			   
			    source = context.createMediaElementSource(audio);

			    source.connect(analyser);
			    analyser.connect(context.destination);
			 
			    frequency_array = new Uint8Array(analyser.frequencyBinCount);

			    self.animate();

			    context_ready = true;

	    	}else{

				analyser = context.createAnalyser();
			    source.connect( analyser );
			    analyser.connect(context.destination);

			    self.animate();
			}
		}

		this.animate = function(){
		    
		    canvas.width = holder.width();
		    canvas.height = holder.height();
		    
		    // find the center 
		    center_x = canvas.width / 2;
		    center_y = canvas.height / 2;
		    radius = canvas.height / 6;

		    if(canvas.height > 500){
		    	bars = 200;
		    	multiplier = 0.7;
		    }else{
				bars = 100;
				multiplier = 0.5;
		    } 

		    //draw a circle
		    ctx.beginPath();
		    ctx.arc(center_x,center_y,radius,0,2*Math.PI);
		    ctx.stroke();
		    
		    analyser.getByteFrequencyData(frequency_array);
		    var i;
		    for(i = 0; i < bars; i++){
		        
		        //divide a circle into equal parts
		        rads = Math.PI * 2 / bars;

		        bar_height = frequency_array[i]*multiplier;
		        
		        // set coordinates
		        x = center_x + Math.cos(rads * i) * (radius);
				y = center_y + Math.sin(rads * i) * (radius);
		        x_end = center_x + Math.cos(rads * i)*(radius + bar_height);
		        y_end = center_y + Math.sin(rads * i)*(radius + bar_height);
		        
		        //draw a bar
		        var lineColor = "rgb(" + frequency_array[i] + ", " + frequency_array[i] + ", " + 205 + ")";

			    ctx.strokeStyle = lineColor;
			    ctx.lineWidth = bar_width;
			    ctx.beginPath();
			    ctx.moveTo(x,y);
			    ctx.lineTo(x_end,y_end);
			    ctx.stroke();
			    
		    }

		    renderVizualitationID = requestAnimationFrame(self.animate);
		}

		this.clean = function(){

			if(renderVizualitationID) cancelAnimationFrame(renderVizualitationID);
			if(ctx)ctx.clearRect(0, 0, canvas.width, canvas.height);
		    if(analyser){
		    	analyser.disconnect();
		    	analyser = null;
		    }

		}

		this.changeSrc = function(){

			analyser = context.createAnalyser();
		    source.connect( analyser );
		    analyser.connect(context.destination);

		    self.animate();
		}
		
	};	

	window.MVPAudioEqualizer = MVPAudioEqualizer;

}(window,jQuery));
