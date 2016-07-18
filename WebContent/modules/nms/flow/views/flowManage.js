define([
	'text!modules/nms/flow/templates/flowManage.html',
	'i18n!modules/nms/flow/i18n/flow.i18n',
	'modules/common/cloud-utils',
	'css!modules/nms/flow/styles/flowManage.css'
], function(viewTpl,i18n,utils,css) {
	var currentObj;
	var rowNum = 20;
	var lastPortId = "";
	var lastObjId = "20160";
	var initTitle = "";
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
			console.log("initialize");
		},
		
		tabActived:function() {
			var paramObjInfo = _.find(utils.getHash().params,function(o){
				return o.key=='portObjId'
			});
			var paramMeName = _.find(utils.getHash().params,function(o){
				return o.key=='meName'
			});
			var paramPortName = _.find(utils.getHash().params,function(o){
				return o.key=='portName'
			});
			
			var mName, pName, temp;
			if (paramMeName && paramMeName.value)mName = currentObj.reverseReplaceStr(paramMeName.value);
			if (mName.length >= 40) mName = mName.substring(0, 40);
			if (paramPortName && paramPortName.value)pName = currentObj.reverseReplaceStr(paramPortName.value);
			if (pName.length >= 20) pName = pName.substring(0, 20);
			var title = mName + "::" + pName;
			if (mName == null && pName == null)title = "端口"+pName+"当前时段无数据";
			if (paramObjInfo && paramObjInfo.value)temp = currentObj.reverseReplaceStr(paramObjInfo.value);
			if (temp != null) {
				lastObjId = temp;
				this.loadInAndOutFlowData(null, lastObjId, title);
			}
		},
		
		reverseReplaceStr:function(str) {
			//str=str.replace(/\%25/g,"%");
			str=str.replace(/\%23/g,"#");
			str=str.replace(/\%26/g,"&");
			str=str.replace(/\%2B/g,"+");
			str=str.replace(/\%20/g," ");
			str=str.replace(/\%2F/g,"/");
			str=str.replace(/\%3F/g,"?");
			str=str.replace(/\%3D/g,"=");
			return str;
		},
		
		events: {
			
		},
		
		_beforeRender:function(){
			console.log("_beforeRender");	
		},
		
		beforeRender:function(){
			console.log("beforeRender");
		},
		
	/*	render:function(){
			console.log("render");
		},*/
		//这里用来进行dom操作
		_render: function() {
			console.log("_render");
			this.$el.html(this.template(this.i18nData));
			var paramObjInfo = _.find(utils.getHash().params,function(o){
				return o.key=='portObjId'
			});
			var paramMeName = _.find(utils.getHash().params,function(o){
				return o.key=='meName'
			});
			var paramPortName = _.find(utils.getHash().params,function(o){
				return o.key=='portName'
			});
			var mName, pName, temp;
			if (paramMeName && paramMeName.value)mName = currentObj.reverseReplaceStr(paramMeName.value);
			if (mName && mName.length >= 40) mName = mName.substring(0, 40);
			
			if (paramPortName && paramPortName.value)pName = currentObj.reverseReplaceStr(paramPortName.value);
			if (pName && pName.length >= 20) pName = pName.substring(0, 20);
			
			var title = mName + "::" + pName;
			if (mName == null && pName == null)title = "无选中端口";
			if (paramObjInfo && paramObjInfo.value)temp = currentObj.reverseReplaceStr(paramObjInfo.value);
			if (temp != null) {
				lastObjId = temp;
			}
			initTitle = title;
			return this;
		},
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {			
			this.layout();
			this.initResourceTree();
			this.initEcharts(initTitle);
			console.log("_afterRender");
		},
		
		layout:function(){
			//计算屏幕高度
			availableHeight = $(document.body).height() - 160; //页面可用高度
			$("#nmsFlowManageleftTree").height(availableHeight);
			$("#nmsFlowManagePortChart1").height(availableHeight-30);
		},
		
		test:function() {
			 utils.ajax('kpiInfoService','loadPortFlowInfo',"inFlow",null).done(function(data){
				 if (data.length > 0) {
					 window.confirm(data[0].value);
				 }else {
					 //window.confirm("bbb");
					 currentObj.initEcharts();
				 }
				  
			 });
		},
		
	    initResourceTree:function(){
	     	var options = {     		
				view: {
					dblClickExpand: false
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback:{
					onExpand :currentObj.expandTree,
					//onAsyncSuccess:currentObj.treeLoadSuccess,
					onClick:currentObj.treeClickFun
				}
			};

			 utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',null,null,null,null,null).done(function(data){
				    options.fNodes = data;
				    $("#nmsFlowManageResourceTree").tree(options);
				    var allNodes= $("#nmsFlowManageResourceTree").tree("instance").getNodes();
				    $("#nmsFlowManageResourceTree").tree('expandNode',allNodes[0],true);
			 });
	    },
		
		initCombobox:function() {
		    var $combobox1 = $('#nmsFlowManageOperaId').combobox({
		        dataTextField: 'name',
		        dataValueField: 'value',
		        dataSource: [
		            {name: '浏览端口组', value: 'selectPortGroup'},
		            {name: '浏览端口', value: 'selectPort'}
		        ]
		    }).combobox('value', 'selectPortGroup');
		},
		
		initAreaCombotree:function(){
			var options = {
				check: {
					enable: true,
					chkboxType: {"Y":"", "N":""}
				},
				view: {
					dblClickExpand: false
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onCheck: onCheck
				},
				fNodes:[
					{id:1, pId:0, name:"北京"},
					{id:2, pId:0, name:"天津"},
					{id:3, pId:0, name:"上海"},
					{id:6, pId:0, name:"重庆"},
					{id:4, pId:0, name:"河北省", open:true, nocheck:true},
					{id:41, pId:4, name:"石家庄"},
					{id:42, pId:4, name:"保定"},
					{id:43, pId:4, name:"邯郸"},
					{id:44, pId:4, name:"承德"},
					{id:5, pId:0, name:"广东省", open:true, nocheck:true},
					{id:51, pId:5, name:"广州"},
					{id:52, pId:5, name:"深圳"},
					{id:53, pId:5, name:"东莞"},
					{id:54, pId:5, name:"佛山"},
					{id:6, pId:0, name:"福建省", open:true, nocheck:true},
					{id:61, pId:6, name:"福州"},
					{id:62, pId:6, name:"厦门"},
					{id:63, pId:6, name:"泉州"},
					{id:64, pId:6, name:"三明"}
				]
			};
			$("#nmsFlowManageAreaTree").tree(options);
			$("#nmsFlowManageAreaId").click(function(){
				showMenu();
			});
			$("#nmsFlowManagenmsFlowManageMenuBtn").click(function() {
				var isShowed = $('#nmsFlowManageAreaId').data('showed');
				if(isShowed && isShowed == 1){
					hideMenu();
					$('#nmsFlowManageAreaId').data('showed',-1);
				}else{
					$('#nmsFlowManageAreaId').data('showed',1);
					showMenu();
					return false;
				}
			});
			var nmsFlowManageAreaId =this.$el.find("#nmsFlowManageAreaId");
			$("#nms_fm_tree_select_menu_checkbox_html").position({
				of: nmsFlowManageAreaId,
				my: "left bottom",
				at: "left top"
			}).hide();
			
			$("#nmsFlowManageAreaTree").width($("#nmsFlowManageAreaTree_group").width() - 10);
			
			function onCheck(e, treeNode) {
				var nodes = $("#nmsFlowManageAreaTree").tree("getCheckedNodes",true);
					v = "";
				for (var i=0, l=nodes.length; i<l; i++) {
					v += nodes[i].name + ",";
				}
				if (v.length > 0 ) v = v.substring(0, v.length-1);
				var cityObj = $("#nmsFlowManageAreaId");
				cityObj.attr("value", v);
			}
			function showMenu() {
				$("#nms_fm_tree_select_menu_checkbox_html").show();
				$("body").on("mousedown", onBodyDown);
			}
			function hideMenu() {
				$("#nms_fm_tree_select_menu_checkbox_html").hide();
				$("body").on("mousedown", onBodyDown);
			}
			function onBodyDown(event) {
				if (!(event.target.id == "nmsFlowManageMenuBtn" || event.target.id == "nmsFlowManageAreaId" || $(event.target).find('#nmsFlowManageAreaTree').length>0 
					|| $(event.target).parents("#menuContent").length>0 || event.target.id.indexOf("nmsFlowManageAreaTree") != -1)) {
					
					hideMenu();
				}
			}
		},
				
		initEcharts:function(title) {
			 // 基于准备好的dom，初始化echarts实例
	        var myChart = echarts.init(document.getElementById('nmsFlowManagePortChart1'));
	        //var myChart2 = echarts.init(document.getElementById('dataChart2'));
	        var timeStr = currentObj.getTimeParam();

	        document.getElementById('nmsFlowManageTimeQuantum').innerHTML='时间段：'+timeStr.beginTime+' 至 '+timeStr.endTime;
	        // 指定图表的配置项和数据
	        var option = {
	        	    title: {
	        	        text: title!=null?title:'端口该时段内无数据',	       
	        	        subtext: '粒度：5分钟',
	        	        subtextStyle : {fontWeight:'lighter'},
	        	        x: 'center'
	        	    },
	        	    tooltip : {
	        	        trigger: 'axis'
	        	    },
	        	    grid: {
	        	        left: '3%',
	        	        right: '4%',
	        	        bottom: '3%',
	        	        containLabel: true
	        	    },
	        	    backgroundColor:'rgb(245, 245, 245)',
	        	    xAxis : [
	        	        {
	        	            type : 'category',
	        	            boundaryGap : false,
	        	            data : ['11','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','20']
	        	        }
	        	    ],
	        	    yAxis : [
	        	        {
	        	        	name: '流量总量/G',
	        	            type : 'value'
	        	        }
	        	    ],
	        	    series : [
	        	        {
	        	            name:'出流量',
	        	            type:'line',
	        	            smooth: true,       	       
	        	            lineStyle: {normal: {color:'rgb(255,0,0)'}},
	        	            data:[0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
	        	        },
	        	        {
	        	            name:'入流量',
	        	            type:'line',
	        	            smooth: true,
	        	            lineStyle: {normal: {color:'rgb(175,240,127)'}},
	        	            areaStyle: {normal: {color:'rgb(175,240,127)'}},
/*	        	            data:[4.8, 5.1, 5.3, 5.5, 5.7, 5.9,
	        	                  5.9, 5.7, 5.5, 5.3, 5.1, 4.8, 
	        	                  4.5, 4.2, 3.9, 3.6, 3.3, 3.0,
	        	                  3.0, 3.3, 3.6, 3.9, 4.2, 4.5]*/
	        	            data:[0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
	        	                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
	        	        }
	        	    ]
	        };

	        // 使用刚指定的配置项和数据显示图表。
	        myChart.setOption(option);
	        //myChart2.setOption(option);
		},
		
		getTimeParam:function() {
	        var currTime = new Date();
	        var yesterdayTime = new Date(currTime.getTime() - 24*60*60*1000);
	        
	        var yearNum = currTime.getFullYear();      
	        var monthNum = (currTime.getMonth()+1) <= 9?"0"+(currTime.getMonth()+1):(currTime.getMonth()+1);
	        var dayNum = currTime.getDate() <= 9?"0"+currTime.getDate():currTime.getDate();
	        var hourNum = currTime.getHours() <= 9?"0"+currTime.getHours():currTime.getHours();
	        var minuteNum = currTime.getMinutes() <= 9?"0"+currTime.getMinutes():currTime.getMinutes();
	        var secondNum = currTime.getSeconds() <= 9?"0"+currTime.getSeconds():currTime.getSeconds();
	        var currTimeStr = yearNum+"-"+monthNum+"-"+dayNum+" "+hourNum+":"+minuteNum+":"+secondNum;
	        
	        var yearNum2 = yesterdayTime.getFullYear();      
	        var monthNum2 = (yesterdayTime.getMonth()+1) <= 9?"0"+(yesterdayTime.getMonth()+1):(yesterdayTime.getMonth()+1);
	        var dayNum2 = yesterdayTime.getDate() <= 9?"0"+yesterdayTime.getDate():yesterdayTime.getDate();
	        var hourNum2 = yesterdayTime.getHours() <= 9?"0"+yesterdayTime.getHours():yesterdayTime.getHours();
	        var minuteNum2 = yesterdayTime.getMinutes() <= 9?"0"+yesterdayTime.getMinutes():yesterdayTime.getMinutes();
	        var secondNum2 = yesterdayTime.getSeconds() <= 9?"0"+yesterdayTime.getSeconds():yesterdayTime.getSeconds();
	        var yesterTimeStr = yearNum2+"-"+monthNum2+"-"+dayNum2+" "+hourNum2+":"+minuteNum2+":"+secondNum2;
	        
	        var timeData = {
				beginTime:yesterTimeStr,
				endTime:currTimeStr
	        }
	        return timeData;
		},
		

		loadInAndOutFlowData:function(resourceTypeId,objId,portName) {
			if (!portName) portName = "端口名称为空";
/*			var curDate = new Date();
			var preDate = new Date(curDate.getTime() - 24*60*60*1000);*/
/*			var curDate = new Date("May 22,2016 20:19:35"); 
			var preDate = new Date("May 21,2016 10:19:35"); */
			var params = currentObj.getTimeParam();
			utils.ajax('kpiInfoService','loadPortFlowInfo',params,7,objId).done(function(data){
				 //utils.ajax('resourceTreeService','loadPortFlowInfo',resourceTypeId,objId).done(function(data){
				 var inFlowX = [], inFlowY = [], outFlowX = [], outFlowY = [], xAxis = [];
				 if (data != null && data.state == "success") {					 
				 	 $.each(data.inFlowList,function(i,item){
				 		 var gbytes = item.value/1024/1024/1024;
				 		 inFlowY[i] = gbytes;
				 	 });
				 	 $.each(data.outFlowList,function(i,item){
				 		var gbytes = item.value/1024/1024/1024;
				 		 outFlowY[i] = gbytes;
				 	 });
				 	 $.each(data.xAxisData,function(i,item){
				 		 xAxis[i] = item.split(" ")[1];
				 	 });
				 	 var portTitle = data.summary.title;
				 	 var oneStepLength = data.summary.oneStepLength;
				 	 var inMax = data.summary.inMax;
				 	 var inMin = data.summary.inMin;
				 	 var inAvg = data.summary.inAvg;				 	 
				 	 var inCurr = data.inFlowList[data.inFlowList.length-1].value;
				 	 var outMax = data.summary.outMax;
				 	 var outMin = data.summary.outMin;
				 	 var outAvg = data.summary.outAvg;
				 	 var outCurr = data.outFlowList[data.outFlowList.length-1].value;
				 	 var beginTime = data.xAxisData[0];
				 	 var endTime = data.xAxisData[data.xAxisData.length-1];
				 	 
					 var myChart = echarts.init(document.getElementById('nmsFlowManagePortChart1'));
					 myChart.setOption({
			        	    title: {
			        	        text: portName,	       
			        	        subtext: '粒度：'+oneStepLength/1000+'秒'+'（'+oneStepLength/1000/60+'分钟）',
			        	        subtextStyle : {fontWeight:'lighter'},
			        	        x: 'center'
			        	    },
			        	    tooltip : {
			        	        trigger: 'axis'
			        	    },
			        	    grid: {
			        	        left: '3%',
			        	        right: '4%',
			        	        bottom: '3%',
			        	        containLabel: true
			        	    },
			        	    backgroundColor:'rgb(245, 245, 245)',
			        	    xAxis : [
			        	        {
			        	            type : 'category',
			        	            boundaryGap : false,
			        	            data : xAxis
			        	        }
			        	    ],
			        	    yAxis : [
			        	        {
			        	        	name: '流量总量/G',
			        	            type : 'value'
			        	        }
			        	    ],
			        	    series : [
			        	        {
			        	            name:'出流量',
			        	            type:'line',
			        	            smooth: true,       	       
			        	            lineStyle: {normal: {color:'rgb(255,0,0)'}},
			        	            data:outFlowY
			        	        },
			        	        {
			        	            name:'入流量',
			        	            type:'line',
			        	            smooth: true,
			        	            lineStyle: {normal: {color:'rgb(175,240,127)'}},
			        	            areaStyle: {normal: {color:'rgb(175,240,127)'}},
			        	            data:inFlowY
			        	        }	
			        	    ]
					 });
					 document.getElementById('nmsFlowManageInMax').innerHTML='入流量      入最大='+(Number(inMax)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageInAvg').innerHTML='入平均='+(Number(inAvg)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageInCurr').innerHTML='入当前='+(Number(inCurr)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageOutMax').innerHTML='出流量      出最大='+(Number(outMax)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageOutAvg').innerHTML='出平均='+(Number(outAvg)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageOutCurr').innerHTML='出当前='+(Number(outCurr)/1024/1024/1024).toFixed(2)+'Gbits/s';
					 document.getElementById('nmsFlowManageTimeQuantum').innerHTML='时间段：'+beginTime+' 至 '+endTime;
					 
				 }else {
					 //window.confirm("bbb");
					 currentObj.initEcharts(portName+"（无数据）");
				 }				  
			 });
			lastObjId = (lastObjId=="20160")?"20161":"20160";
		},
		
		str2Number:function() {
			
		},
		
	    treeClickFun:function(event, node){
			if (!node || !node.attributes)
				return;
			
			var resourceTypeId = node.attributes["resourceTypeId"];
			var objId = node.attributes["objId"];
	        var nodeName = node.name;
	        var treeInstance = $("#nmsFlowManageResourceTree").tree("instance");
	        
			if (null != node.attributes.objType && node.attributes.objType == "physicsPort") {
				
				if (objId != lastPortId) {
					var parentNode = node.getParentNode();				
					var pName = parentNode.name;
					if (pName.length >= 40) pName = pName.substring(0, 40);
					var title = pName + "::" + nodeName;
					if (null == parentNode)title = nodeName;
					
					//objId = lastObjId;
					currentObj.loadInAndOutFlowData(resourceTypeId, objId, title);
					lastPortId = objId;					
				}
			}		
	    },

		
	    expandTree:function(event, node){
			if (!node || !node.attributes)
				return;
			var objType = node.attributes["objType"];
			var objId = node.attributes["objId"];
			var AllchildrenNode = node.children;
	        currentObj.loadResourceTreeByNode(node,objType,objId);

		    $.each(AllchildrenNode,function(index,item){
		    	 objType = item.attributes["objType"];
			     objId = item.attributes["objId"];
	            currentObj.loadResourceTreeByNode(item,objType,objId);
		    });
	    },

	    loadResourceTreeByNode:function(node,objType,objId){

			utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){			 
				 if(data.length!=0){
				 	var zTree =  $("#nmsFlowManageResourceTree").tree("instance");
				 	if(node.children==null){
	                  zTree.addNodes(node,data);
				 	};
				 	
				 	var emsNodes=node.children;
				 	$.each(emsNodes,function(i,item){
				 	   if(item.attributes["objType"]=="ems"){//无传输系统，查询ems下的网元	
	                      currentObj.loadElement(item,"ems",item.attributes["objId"]);
			           }
				 	});

				 }
				 
			});	
	    },

	    loadElement:function(node,objType,objId){
	    	utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){	
	        		if(data.length!=0){
				 	    var zTree =  $("#nmsFlowManageResourceTree").tree("instance");
				 	    if(node.children==null){
	                       zTree.addNodes(node,data);
				 	    };
				 	    
				 	    var portNodes=node.children;
				 	    $.each(portNodes,function(i,item){
				 	      if(item.attributes["objType"]=="element"){//查询网元下的端口	
	                        currentObj.loadPort(item,"element",item.attributes["objId"]);
			              }
				 	    });			 	    
				 	}
	        });
	    },

	    loadPort:function(node,objType,objId){
	    	utils.ajax('resourceTreeService','loadResourceTreeByEMSPath',objType,objId,null,null,null).done(function(data){	
	        		if(data.length!=0){
				 	    var zTree =  $("#nmsFlowManageResourceTree").tree("instance");
				 	    if(node.children==null){
	                       zTree.addNodes(node,data);
				 	    };			 	    
				 	    
				 	}
	        });
	    }
				
	});
});