(function($){
	var zflow = $.zflow;
	
	zflow.node = {};
    
    zflow.node.init = function(activity)
    {
    	return new zflow.node.Node(activity);
    };
	
	zflow.node.config = {
		imageRadius:15,//节点大小
		textHeight:20//节点文字高度
	};
	
	zflow.node.getNodeOffsetY = function(){
		return ((zflow.config.nodeHeight-(zflow.node.config.imageRadius+zflow.node.config.textHeight))/2+zflow.node.config.imageRadius/2);
	};
    
    zflow.node.Node = function(activity)
    {
		this.activity = activity;
    	//reset的时候进行重新设置
    	this.x = 0;
    	this.y = 0;
    	this.imageRadius = zflow.node.config.imageRadius;
		this.parallelNodeCrossLength = zflow.node.config.imageRadius*7/10;
    	this.textHeight = zflow.node.config.textHeight;
        if(zflow.state.direction ==zflow.constant.DIRECTION.H)
    	{
        	this.nodeWidth = this.imageRadius+zflow.config.space;
        	this.nodeHeight = zflow.config.nodeHeight;
    	}else if(zflow.state.direction ==zflow.constant.DIRECTION.V)
		{
    		this.nodeWidth = zflow.config.nodeWidth;
        	this.nodeHeight = this.imageRadius+zflow.config.space+this.textHeight;
		}
        this.textWidth = this.nodeWidth;
    	this.offsetX = (this.nodeWidth - this.imageRadius)/2;
    	this.offsetY = (this.nodeHeight-(this.imageRadius+this.textHeight))/2;
    	
    	
    	this.image = null;
    	this.shade = null;
    	this.text = null;
		
    	this.reset = function(paper,x,y)
    	{
    		this.x = x;
    		this.y = y;
    		var color = $.color;
    		var nodeInfo = {};
			var fontSize = 12;
        	if(this.activity.type =="Start"){
            	//圆
//            	this.image = paper.circle(this.x+this.nodeWidth/2,y+this.imageRadius/2+this.offsetY,this.imageRadius/2);
//        		this.image.attr({stroke: "none","fill":"r(0.75, 0.25)rgb(181, 251, 162)-rgb(43, 194, 56)","fill-opacity":1});
        		//阴影
//        		this.shade = paper.ellipse(this.x+this.nodeWidth/2,y+this.imageRadius/2+this.imageRadius/2-this.imageRadius/2/50+this.offsetY,
//        				this.imageRadius/2, this.imageRadius/2/8);
//        		this.shade.attr({stroke: "none",fill: "rhsb(" + 0.5 + ", 1, .25)-hsb(" + 0.5 + ", 1, .25)",opacity: 0});
        		
        		this.image = paper.rect(this.x+this.offsetX,this.y+this.offsetY,this.imageRadius,this.imageRadius);
        		this.image.attr({stroke: "none","fill":"rgb(0, 208, 5)",r:2,"fill-opacity":1});
        		
        		//文字
        		this.text = paper.text(this.x+this.nodeWidth/2,y+this.imageRadius+this.textHeight/2+this.offsetY,this.activity.name);
        		this.text.attr({width:this.nodeWidth,height:this.textHeight,"font-size":fontSize});
            }else if(this.activity.type =="Finish"){
            	//圆
//            	this.image = paper.circle(this.x+this.nodeWidth/2,y+this.imageRadius/2+this.offsetY,this.imageRadius/2);
//        		this.image.attr({stroke: "none","fill":"r(0.75, 0.25)rgb(251, 188, 191)-rgb(224, 65, 59)","fill-opacity":1});
        		//阴影
//        		this.shade = paper.ellipse(this.x+this.nodeWidth/2,y+this.imageRadius/2+this.imageRadius/2-this.imageRadius/2/50+this.offsetY,
//        				this.imageRadius/2, this.imageRadius/2/8);
//        		this.shade.attr({stroke: "none",fill: "rhsb(" + 0.5 + ", 1, .25)-hsb(" + 0.5 + ", 1, .25)",opacity: 0});
            	
            	this.image = paper.rect(this.x+this.offsetX,this.y+this.offsetY,this.imageRadius,this.imageRadius);
        		this.image.attr({stroke: "none","fill":"rgb(208, 0, 5)",r:2,"fill-opacity":1});
        		
        		//文字
        		this.text = paper.text(this.x+this.nodeWidth/2,y+this.imageRadius+this.textHeight/2+this.offsetY,this.activity.name);
        		this.text.attr({width:this.nodeWidth,height:this.textHeight,"font-size":fontSize});
            }else if(this.activity.type == "ParallelX"){
        		var px = this.x + this.offsetX + (this.imageRadius - this.parallelNodeCrossLength)/2;
            	var py = this.y + this.offsetY + (this.imageRadius - this.parallelNodeCrossLength)/2;
            	var pWidth = this.parallelNodeCrossLength;
            	var pHeight = this.parallelNodeCrossLength;
            	this.image = paper.rect(px,py,pWidth,pHeight);
                this.image.attr({stroke: color.colorMoreGray, "stroke-width": 2,fill:color.colorPurple, transform : "r45"});
                this.path = paper.path([
    										["M", px+pWidth/3, py+pHeight/3], 
    										["L", px+pWidth*2/3, py+pHeight*2/3], 
    										["M", px+pWidth*2/3, py+pHeight/3], 
    										["L", px+pWidth/3, py+pHeight*2/3]
                       	                ]).attr({stroke: color.colorMoreGray, "stroke-width": 2});
                this.text = paper.text(this.x+this.nodeWidth/2,this.y+this.imageRadius+this.textHeight/2+this.offsetY,this.activity.name);
        		this.text.attr({width:this.nodeWidth,height:this.textHeight,"font-size":fontSize});
        	}else if(this.activity.type == "RelationX"){
				var px = this.x + this.offsetX + (this.imageRadius - this.parallelNodeCrossLength)/2;
            	var py = this.y + this.offsetY + (this.imageRadius - this.parallelNodeCrossLength)/2;
            	var pWidth = this.parallelNodeCrossLength;
            	var pHeight = this.parallelNodeCrossLength;
            	this.image = paper.rect(px,py,pWidth,pHeight);
                this.image.attr({stroke: color.colorMoreGray, "stroke-width": 2,fill:color.colorPurple, transform : "r45"});
                this.path = paper.path([
                       	                    ["M", px+pWidth/5, py+pHeight/2], 
                       	                    ["L", px+pWidth*4/5, py+pHeight/2], 
                       	                    ["M", px+pWidth/2, py+pHeight/5], 
                       	                    ["L", px+pWidth/2, py+pHeight*4/5]
                       	                ]).attr({stroke: color.colorMoreGray, "stroke-width": 2});
                this.text = paper.text(this.x+this.nodeWidth/2,this.y+this.imageRadius+this.textHeight/2+this.offsetY,this.activity.name);
        		this.text.attr({width:this.nodeWidth,height:this.textHeight,"font-size":fontSize});
    		}else{
            	var col = color.colorGray;
            	var running = false;
        		//判断是否为定义图
        		if (zflow.state.mode == zflow.constant.MODE.INST) {
        			if(zflow.state.stateConfig[this.activity.state])
    				{
        				col = zflow.state.stateConfig[this.activity.state][1];
        				running = zflow.state.stateConfig[this.activity.state][2];
    				}
				}
        		this.image = paper.rect(this.x+this.offsetX,this.y+this.offsetY,this.imageRadius,this.imageRadius);
                this.image.attr({stroke: "none",fill:col,r:10,cursor :'pointer'});
				this.image.dblclick(function () { 
					eval("nodeDbClick('" + nodeInfo.areaId + "','" + nodeInfo.name + "');");
				});
				//设置节点信息
				nodeInfo.flowTips = this.activity.flowTips;
				nodeInfo.name = this.activity.name;
				nodeInfo.areaId = this.activity.areaId;
				if(this.activity.flowTips != ''){
					this.image.mouseover(function () {
						if (typeof(floatDiv)  != undefined && typeof(floatDiv)  != 'undefined') {
							var event = window.event || arguments.callee.caller.arguments[0];
							var x = event.clientX;
							var y= event.clientY;
							document.all.floatDivTitleSpan.innerHTML = nodeInfo.flowTips;
							floatDiv.show(x + '~' + y);
						}
					});
					this.image.mouseout(function () {
						if(typeof(floatDiv) != undefined && typeof(floatDiv)  != 'undefined'){
							floatDiv.close();
						}
					});
				}
				
                var rect = this.image;
                if(running == true){
            		// 闪烁效果
            		setInterval(function(){rect.animate({"fill-opacity": .2}, 800, rect.attr({"fill-opacity": 1}))},800);
                }
                this.text = paper.text(this.x+this.nodeWidth/2,this.y+this.imageRadius+this.textHeight/2+this.offsetY,this.activity.name);
        		this.text.attr({width:this.nodeWidth,height:this.textHeight,"font-size":fontSize});
    		};
    	};

    	//============四个连线点====start======
    	this.getTopPoint = function(){
    		return {x:this.x+this.nodeWidth/2,y:this.y+this.offsetY};
    	};
    	this.getLeftPoint = function(){
    		return {x:this.x+this.offsetX,y:this.y+this.imageRadius/2+this.offsetY};
    	};
    	this.getRightPoint = function(){
    		return {x:this.x+this.offsetX+this.imageRadius,y:this.y+this.imageRadius/2+this.offsetY};
    	};
    	this.getBottomPoint = function(){
    		    		return {x:this.x+this.nodeWidth/2,y:this.y+this.offsetY+this.imageRadius+this.textHeight};
    	};
        //============四个连线点====end======
    	
    	this.getWidth = function()
    	{
    		return this.nodeWidth;
    	};
    	this.getHeight = function()
    	{
    		return this.nodeHeight;
    	};
    };
})(jQuery);
