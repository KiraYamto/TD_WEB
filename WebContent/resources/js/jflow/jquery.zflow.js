//=========zflow===========
(function($){
    var zflow = {};
    var color = $.color;
    
    zflow.config = {
        nodeWidth: 80,//节点的宽度-----垂直排版时生效
        nodeHeight: 80,//节点的高度-----水平排版时生效
        space: 48,//节点之间连线的长度
        offsetX: 30,//整个流程图的水平偏移
        offsetY: 30,//整个流程图的垂直偏移
        hLine: 10//跳转线条之间的高度间隔
    };
    
    zflow.constant = {
        MODE: {
            INST: 'inst',
            DEF: 'def'
        },
        DIRECTION: {
            H: 'horizontal',
            V: 'vertical'
        }
    };
    
    zflow.state = {
        mode: zflow.constant.MODE.DEF,//def:定义图       inst:实例图
        direction: zflow.constant.DIRECTION.H,//vertical：垂直排版     horizontal：水平排版
        //状态编码：状态描述，状态颜色，是否闪烁
        stateConfig: {
            "10D": ["正在处理", color.colorGreen, true],
            "10F": ["处理完成", color.colorBlue, false],
            "10A": ["废弃工单", color.colorABOLOSH, false],
            "FFF": ["未处理", color.colorLOCKED, false],
            "10I": ["未派发", color.colorYellow, false],
            "10E": ["异常", color.colorRed, false],
            "10R": ["退单", color.colorPurple, false]
        }
    };
    
    //----------activity-------start--------
    zflow.Activity = function(activityXML){
        //节点属性========start================
        this.activityXML = activityXML;
        this.id = $(activityXML).attr("id");
        this.name = $(activityXML).attr("name");
        this.tacheId = $(activityXML).attr("tacheId");
        this.isRunning = $(activityXML).attr("isRunning");
        this.type = $(activityXML).attr("type");
        this.state = $(activityXML).attr("state");
        this.isTimeOut = $(activityXML).attr("isTimeOut");
        this.workOrderId = $(activityXML).attr("workOrderId");
        this.direction = $(activityXML).attr("direction");
        //added by xujun 2010-09-20 ur62311 原子流程改造——组合流程的流程实例图修改
        this.atomFlowId = $(activityXML).attr("atomFlowId");
        //add by 陈智堃 2011-07-15 光进铜退改造，活动所在的原子流程/数据驱动环节定义ID
        this.atomActivityId = $(activityXML).attr("atomActivityId");
        //节点属性========end================
        
        this.paper = null;//画板对象
        this.parentParallel = null;//父的并行结构
        this.x = 0;//x坐标
        this.y = 0;//y坐标
        this.node = null;
        
        this.node = zflow.node.init(this);
        
        //更新数据，更新paper、父的并行结构，x坐标和y坐标
        this.updateData = function(paper, parentParallel, x, y){
            this.paper = paper;
            this.parentParallel = this.parentParallel;
            this.x = x;
            this.y = y;
        };
        
        //获取下一个节点的水平坐标
        this.getNextY = function(){
            return this.y + this.node.getHeight();
        };
        
        //获取下一个节点的水平坐标
        this.getNextX = function(){
            return this.x + this.node.getWidth();
        };
        
        //根据id查找节点
        this.findActivityById = function(id){
            if (this.id == id) {
                return this;
            }
            return null;
        };
        
        
        //水平宽度
        this.hSize = function(){
            return this.node.getWidth();
        };
        
        //垂直高度
        this.vSize = function(){
            return this.node.getHeight();
        };
        
        //============四个连线点====start======
        this.getTopPoint = function(){
            return this.node.getTopPoint();
        };
        this.getLeftPoint = function(){
            return this.node.getLeftPoint();
        };
        this.getRightPoint = function(){
            return this.node.getRightPoint();
        };
        this.getBottomPoint = function(){
            return this.node.getBottomPoint();
        };
        //============四个连线点====end======
        
        //绘制方法,id为判断实例图or定义图
        this.paint = function(size){
            var config = zflow.config;
            
            if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                //重置下x，y坐标的位置
                this.x = this.x + config.offsetX;
                this.y = this.y + size / 2 - 0.5 * zflow.config.nodeHeight + config.offsetY;
            } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                //重置下x，y坐标的位置
                this.x = this.x + config.offsetX + size / 2 - 0.5 * zflow.config.nodeWidth;
                this.y = this.y + config.offsetY;
            }
            
            //            console.log(this.name+";"+this.x+";"+this.y);
            
            if (this.node) {
                this.node.reset(this.paper, this.x, this.y);
            }
        };
    };
    //----------activity--------end-------
    
    //----------Parallel--------start-------
    zflow.Parallel = function(parallelXML){
        this.parallelXML = parallelXML;
        
        //分支数组
        this.branches = new Array();
        //处理各分支上的节点
        var childrens = $(parallelXML).children();
        for (var i = 0; i < childrens.length; i++) {
            var branchXML = $(childrens[i]);
            var branch = new Object();
            branch.activities = new Array();
            var branchChildrens = $(branchXML).children();
            for (var j = 0; j < branchChildrens.length; j++) {
                var childNode = $(branchChildrens[j]);
                switch ($(childNode)[0].nodeName) {
                    case "Activity":{
                        branch.activities.push(new zflow.Activity(childNode));
                        break;
                    }
                    case "Parallel":{
                        branch.activities.push(new zflow.Parallel(childNode));
                        break;
                    }
                }
            }
            this.branches.push(branch);
        };
        
        this.paper = null;//画板对象
        this.parentParallel = null;//父的并行结构
        this.x = 0;//x坐标
        this.y = 0;//y坐标
        this.curBranchIndex = 0;//用来画空分支线的变量
        this.updateData = function(paper, parentParallel, x, y){
            this.paper = paper;
            this.parentParallel = this.parentParallel;
            this.x = x;
            this.y = y;
            
			var sumV = 0,sumH = 0;
			var parallelSize = sizeOfParallel(this);
			
            for (var i = 0; i < this.branches.length; i++) {
                var branch_v = 0, branch_h = 0;
                
				var hy=0,vx=0;
				var branchSize = sizeOfBranch(this.branches[i]);
                if (zflow.state.direction == zflow.constant.DIRECTION.H) {
					
					hy = this.y + sumV + branchSize.v / 2;
					sumV += branchSize.v;
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
					vx = this.x + sumH + branchSize.h / 2;
					sumH += branchSize.h;
                }
				hy = hy - parallelSize.v/2;
				vx = vx - parallelSize.h/2;
                
                //空分支
                if (this.branches[i].activities.length == 0) {
                	this.branches[i].info = {vx:vx,hy:hy};
                    continue;
                }
                
                for (var j = 0; j < this.branches[i].activities.length; j++) {
                    // 需要计算x,y出来-----怎么计算x，y?
                    var tempX = 0, tempY = 0;
                    if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                        if (j == 0) {
                            tempX = this.x;
                        } else {
                            tempX = this.branches[i].activities[j - 1].getNextX();
                        }
						tempY = hy;
                    } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                        if (j == 0) {
                            tempY = this.y;
                        } else {
                            tempY = this.branches[i].activities[j - 1].getNextY();
                        }
						tempX = vx;
                    }
                    this.branches[i].activities[j].updateData(this.paper, this, tempX, tempY);
                }
            }
        };
        
        //获取下一个节点的垂直坐标---------垂直排版用到
        this.getNextY = function(){
            return this.y + this.vSize();
        };
        
        //获取下一个节点的水平坐标---------水平排版用到
        this.getNextX = function(){
            return this.x + this.hSize();
        };
        
        //根据id查找节点
        this.findActivityById = function(id){
            for (var i = 0; i < this.branches.length; i++) {
                for (var j = 0; j < this.branches[i].activities.length; j++) {
                    var result = this.branches[i].activities[j].findActivityById(id);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        };
        
        this.findNextParallel = function(id){
            for (var i = 0; i < this.branches.length; i++) {
                for (var j = 0; j < this.branches[i].activities.length - 1; j++) {
                    if (this.branches[i].activities[j].id == id && this.branches[i].activities[j + 1] instanceof zflow.Parallel) {
                        return this.branches[i].activities[j + 1];
                    } else if (this.branches[i].activities[j] instanceof zflow.Parallel) {
                        var result = this.branches[i].activities[j].findNextParallel(id);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
            return null;
        };
        
        this.getBlankBranchInfo = function(){
            for (var i = this.curBranchIndex; i < this.branches.length; i++) {
                if (this.branches[i].activities.length == 0) {
                    this.curBranchIndex = i;
                    return this.branches[i].info;
                }
            }
            return null;
        };
		
		var sizeOfBranch = function(branch)
		{
			var branch_v = 0, branch_h = 0;
            for (var j = 0; j < branch.activities.length; j++) {
                var activity = branch.activities[j];
                
                if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                    if (branch_v < activity.vSize()) {
                        branch_v = activity.vSize();
                    }
                    branch_h = branch_h + activity.hSize();
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                    if (branch_h < activity.hSize()) {
                        branch_h = activity.hSize();
                    }
                    branch_v = branch_v + activity.vSize();
                }
            }
			if(branch.activities.length==0)
			{
				if (zflow.state.direction == zflow.constant.DIRECTION.H) {
					return {v:zflow.config.nodeHeight,h:0};
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
					return {v:0,h:zflow.config.nodeWidth};
                }
			}
			return {v:branch_v,h:branch_h};
		};
		
		//计算v和h（即vSize()和hSize()）----并行结构的垂直高度和水平宽度
		var sizeOfParallel = function(parallel)
		{
			var v=0,h=0;
			for (var i = 0; i < parallel.branches.length; i++) {
                var branchSize = sizeOfBranch(parallel.branches[i]);
				var branch_v = branchSize.v;
				var branch_h = branchSize.h;
                if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                    branch_v = (branch_v == 0 ? zflow.config.nodeHeight : branch_v);
                    parallel.branches[i].v = branch_v;
                    v = v + branch_v;
                    if (h < branch_h) {
                        h = branch_h;
                    }
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                    branch_h = (branch_h == 0 ? zflow.config.nodeWidth : branch_h);
                    parallel.branches[i].h = branch_h;
                    h = h + branch_h;
                    if (v < branch_v) {
                        v = branch_v;
                    }
                }
            }
			return {v:v,h:h};
		}
        
        //获取垂直高度
        this.vSize = function(){
			var parallelSize = sizeOfParallel(this);
			return parallelSize.v;
        };
        
        //获取水平宽度
        this.hSize = function(){
            var parallelSize = sizeOfParallel(this);
			return parallelSize.h;
        };
        
        //绘制方法,id为判断实例图or定义图  size为广度大小（像素级别）
        this.paint = function(size){
            for (var i = 0; i < this.branches.length; i++) {
                for (var j = 0; j < this.branches[i].activities.length; j++) {
                    this.branches[i].activities[j].paint(size);
                }
            }
        }
    };
    //----------Parallel--------end-------
    
    //----------Transition--------start-------
    zflow.Transition = function(transitionXML){
        //===========线条属性初始化======start==========
        this.transitionXML = transitionXML;
        this.id = $(transitionXML).attr("id");
        this.name = $(transitionXML).attr("name");
        this.from = $(transitionXML).attr("from");
        this.to = $(transitionXML).attr("to");
        this.isRunning = $(transitionXML).attr("isRunning");
        this.direction = $(transitionXML).attr("direction");
        this.lineType = $(transitionXML).attr("lineType");
        if ($(transitionXML).attr("lineType") == "控制线条") {
            this.lineType = "Control";
        }
        //===========线条属性初始化======end==========
        
        this.startNode = null;//线条的开始节点
        this.endNode = null;//线条的结束节点
        this.nextParallel = null;
        this.paper = null;//画板对象
        this.line = null;//绘制的线条对象
        //绘制方法
        this.paint = function(size, tTimes){
            //跳转线条的画法存在问题，暂时挂着，想一下再完善---------todo
            if (this.lineType == "Control") {
                var ctrlOffset = zflow.config.hLine * tTimes;
                
                if (zflow.state.direction == zflow.constant.DIRECTION.H) {
					var startPoint = this.startNode.getTopPoint();
	                var endPoint = this.endNode.getTopPoint();
	                var startX = startPoint.x;
	                var startY = startPoint.y;
	                var endX = endPoint.x;
	                var endY = endPoint.y;
					var midY = zflow.config.offsetY - ctrlOffset;
                    this.line = this.paper.path("M" + startX + " " + startY 
						+ "L" + startX + " " + midY 
						+ "L" + endX + " " + midY 
						+ "L" + endX + " " + endY + "");
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
					var startPoint = this.startNode.getLeftPoint();
	                var endPoint = this.endNode.getLeftPoint();
	                var startX = startPoint.x;
	                var startY = startPoint.y;
	                var endX = endPoint.x;
	                var endY = endPoint.y;
					var midX = zflow.config.offsetX - ctrlOffset;
                    this.line = this.paper.path("M" + startX + " " + startY 
						+ "L" + midX + " " + startY 
						+ "L" + midX + " " + endY 
						+ "L" + endX + " " + endY + "");
                }
                this.line.attr({
                    "stroke-width": 2,
                    stroke: "#444",
                    "arrow-end": "classic-wide-long"
                });
            } else {
                if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                    var startPoint = this.startNode.getRightPoint();
                    var endPoint = this.endNode.getLeftPoint();
                } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                    var startPoint = this.startNode.getBottomPoint();
                    var endPoint = this.endNode.getTopPoint();
                }
                
                var startX = startPoint.x;
                var startY = startPoint.y;
                
                var endX = endPoint.x;
                var endY = endPoint.y;
				
				var changePos = zflow.config.space * 2 / 5;
				
				//空分支线条
                if (this.nextParallel != null) {
					var info = this.nextParallel.getBlankBranchInfo();
                    if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                        //重置下y坐标的位置
                        var midY = info.hy + size / 2 - 0.5 * zflow.config.nodeHeight + zflow.config.offsetY 		
									+ zflow.node.getNodeOffsetY();
                        this.line = this.paper.path("M" + startX + " " + startY 
							+ "L" + (startX + changePos) + " " + startY 
							+ "L" + (startX + changePos) + " " + midY 
							+ "L" + (endX - changePos) + " " + midY 
							+ "L" + (endX - changePos) + " " + endY 
							+ "L" + endX + " " + endY);
                    } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                        //重置下x坐标的位置
                        var midX = info.vx  + size / 2 - 0.5 * zflow.config.nodeWidth + zflow.config.offsetX + (zflow.config.nodeWidth/2);
                        this.line = this.paper.path("M" + startX + " " + startY 
							+ "L" + startX + " " + (startY + changePos) 
							+ "L" + midX + " " + (startY + changePos) 
							+ "L" + midX + " " + (endY - changePos) 
							+ "L" + endX + " " + (endY - changePos) 
							+ "L" + endX + " " + endY);
                    }
                } else {
                    //并行结构折线
                    if (zflow.state.direction == zflow.constant.DIRECTION.H && startY != endY) {
                        if (this.startNode.type == "Parallel") {
                            this.line = this.paper.path("M" + startX + " " + startY 
								+ "L" + (startX + changePos) + " " + startY 
								+ "L" + (startX + changePos) + " " + endY 
								+ "L" + endX + " " + endY);
                        } else if (this.endNode.type == "Relation") {
                            this.line = this.paper.path("M" + startX + " " + startY 
								+ "L" + (endX - changePos) + " " + startY 
								+ "L" + (endX - changePos) + " " + endY 
								+ "L" + endX + " " + endY);
                        }
                    } else if (zflow.state.direction == zflow.constant.DIRECTION.V && startX != endX) {
						if (this.startNode.type == "Parallel") {
							this.line = this.paper.path("M" + startX + " " + startY 
								+ "L" + startX + " " + (startY + changePos)  
								+ "L" + endX + " " + (startY + changePos)  
								+ "L" + endX + " " + endY);
                        } else if (this.endNode.type == "Relation") {
                           this.line = this.paper.path("M" + startX + " " + startY 
								+ "L" + startX + " " + (endY - changePos)  
								+ "L" + endX + " " + (endY - changePos)  
								+ "L" + endX + " " + endY);
						}
                    } else {
                        //普通的线条
                        this.line = this.paper.path("M" + startX + " " + startY + "L" + endX + " " + endY + "");
                    }
                }
                this.line.attr({
                    "stroke-width": 2,
                    stroke: "#444",
                    "arrow-end": "classic-wide-long"
                });
                if (this.lineType == "Virtual") {
                    this.line.attr({
                        "stroke-dasharray": "-"
                    });
                }
            }
        };
    };
    //----------Transition--------end-------
    
    zflow.init = function(ele, flowXML){
        //初始化变量
        var activities = new Array();
        var transitions = new Array();
        //var flowXML = $.parseXML(flowXML);
        
        //解析节点
        $(flowXML).find("Activities").children().each(function(){
            switch (this.nodeName) {
                case "Activity":{
                    activities.push(new zflow.Activity(this));
                    break;
                }
                case "Parallel":{
                    activities.push(new zflow.Parallel(this));
                    break;
                }
            }
        });
        //初始化展示实例画板
        var paper = Raphael($(ele)[0].id);
        
        //节点画图信息更新，主要更新每个节点坐标
        var hSize = 0, vSize = 0;
        for (var i = 0; i < activities.length; i++) {
            if (zflow.state.direction == zflow.constant.DIRECTION.H) {
                activities[i].updateData(paper, null, i != 0 ? activities[i - 1].getNextX() : i, 0);
                hSize = hSize + activities[i].hSize();
                if (vSize < activities[i].vSize()) {
                    vSize = activities[i].vSize();
                }
            } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
                activities[i].updateData(paper, null, 0, i != 0 ? activities[i - 1].getNextY() : i);
                vSize = vSize + activities[i].vSize();
                if (hSize < activities[i].hSize()) {
                    hSize = activities[i].hSize();
                }
            }
        }
        
        var findActivityById = function(id){
            for (var i = 0; i < activities.length; i++) {
                var result = activities[i].findActivityById(id);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        var findNextParallel = function(id){
            for (var i = 0; i < activities.length - 1; i++) {
                if (activities[i].id == id && activities[i + 1] instanceof zflow.Parallel) {
                    return activities[i + 1];
                } else if (activities[i] instanceof zflow.Parallel) {
                    var result = activities[i].findNextParallel(id);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        }
        var controlCount = 0;//记录lineType为“Control”次数，扩展画板大小
        //解析线条
        $(flowXML).find("Transition").each(function(){
            var transition = new zflow.Transition(this);
            transition.startNode = findActivityById(transition.from);
            transition.endNode = findActivityById(transition.to);
            if (transition.startNode.type == "Parallel" && transition.endNode.type == "Relation") {
                transition.nextParallel = findNextParallel(transition.from);
            }
            if (transition.lineType == "Control") {
                controlCount++;
            }
            if (transition.startNode == null) {
                throw new Error(transition.id + "的startNode不能为空");
            }
            if (transition.endNode == null) {
                throw new Error(transition.id + "的endNode不能为空");
            }
            transition.paper = paper;
            transitions.push(transition);
        });
        
        if (zflow.state.direction == zflow.constant.DIRECTION.H) {
            //重置画板的大小，根据流程图的大小自动适配
            paper.setSize(hSize + 2 * zflow.config.offsetX, vSize + 2 * zflow.config.offsetY + controlCount * zflow.config.hLine * 2);
            
            //画流程图,新增传递id，用于判断实例图or定义图
            for (var i = 0; i < activities.length; i++) {
                activities[i].paint(vSize);
            }
            
            //记录lineType为“Control”次数，进行画线转换
            var tTimes = 0;
            for (var i = 0; i < transitions.length; i++) {
                if (zflow.state.mode == zflow.constant.MODE.DEF && transitions[i].lineType == "Control") {
                    tTimes++;
                }
                transitions[i].paint(vSize, tTimes);
            }
        } else if (zflow.state.direction == zflow.constant.DIRECTION.V) {
            //重置画板的大小，根据流程图的大小自动适配
            paper.setSize(hSize + 2 * zflow.config.offsetX + controlCount * zflow.config.hLine * 2, vSize + 2 * zflow.config.offsetY);
            
            //画流程图,新增传递id，用于判断实例图or定义图
            for (var i = 0; i < activities.length; i++) {
                activities[i].paint(hSize);
            }
            
            //记录lineType为“Control”次数，进行画线转换
            var tTimes = 0;
            for (var i = 0; i < transitions.length; i++) {
                if (zflow.state.mode == zflow.constant.MODE.DEF && transitions[i].lineType == "Control") {
                    tTimes++;
                }
                transitions[i].paint(hSize, tTimes);
            }
        }
    };
    zflow.initState = function(ele, stateConfig){
        $.extend(zflow.state.stateConfig, stateConfig);
        var paperState = Raphael($(ele)[0].id, "100%", "100%");
        var leftOffset = 30;
        var topOffset = 10;
        var rectSize = 17;
        var fontSize = 15;
        paperState.text(leftOffset, topOffset + rectSize / 2, "图例：").attr({
            "font-size": fontSize
        });
        var running = new Array();
        var curLeftOffset = leftOffset + 30;
        for (var key in zflow.state.stateConfig) {
            var r = paperState.rect(curLeftOffset, topOffset, rectSize, rectSize).attr({
                fill: zflow.state.stateConfig[key][1],
                stroke: "#ffffff"
            });
            curLeftOffset = curLeftOffset + rectSize + zflow.state.stateConfig[key][0].length * fontSize / 2 + 10;
            paperState.text(curLeftOffset, topOffset + rectSize / 2, zflow.state.stateConfig[key][0]).attr({
                "font-size": fontSize
            });
            curLeftOffset = curLeftOffset + zflow.state.stateConfig[key][0].length * fontSize / 2 + 20;
            if (zflow.state.stateConfig[key][2]) {
                running.push(r);
            }
        }
        for (var key in running) {
            //闪烁效果
            setInterval(function(){
                running[key].animate({
                    "fill-opacity": .2
                }, 800, running[key].attr({
                    "fill-opacity": 1
                }))
            }, 800);
        }
    };
    
    $.fn.zflow = function(flowXML, state){
        $.extend(zflow.state, state);
        this.each(function(){
            zflow.init(this, flowXML);
        });
    };
    $.zflow = zflow;
})(jQuery);
//=========zflow===========
