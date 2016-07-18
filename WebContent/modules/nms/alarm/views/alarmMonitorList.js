define([
	'text!modules/nms/alarm/templates/alarmMonitorList.html',
	'i18n!modules/nms/alarm/i18n/alarm.i18n',
	'modules/common/cloud-utils',
	'css!modules/nms/alarm/styles/alarmMonitorList.css',
	'modules/nms/common/alarmMonitor.websocket'
], function(viewTpl, i18n,utils,css, monitorWS) {
	var currentObj;
	var availableHeight;
	var centerPanelHeight;
	var filterCatalogId = 1; //过滤器目录ID
	
	/*一下是告警相关的属性*/
	var timerId;
	var queueData = [];// 队列数据
	var queueCostSize = 100;// 一次消费队列数量
	var batchInsertSize = 10; //批量插入的数量
	var showPageRowNum = 500// 页面展示最大的行数量
	var clearAlarmRowNumber = 200; //清除告警列表显示的最大数量
	var queueCostTime = 0; // ms 每消费一次，暂停多长时间	
	var receiveAlarmCount = 0; //监控页面接收的告警数量
	
	var resizeLock = false; //窗口resize事件lock
	
	var alarmListShowMaxNum = [
	    {text : 100,value : 100},{text : 200,value : 200},{text : 500,value : 500},{text : 1000,value : 1000}, 
	    {text : 2000,value : 2000},{text : 3000,value : 3000}];	
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		initialize:function(){
			currentObj = this;
			this.monitorSwitchId = "nms_alarm_monitor_switch_checkbox";
			this.newGridShowMaxNumId = "nms_alarm_monitor_toolbar_addShowMaxNum";
			this.historyGridShowMaxNumId = "nms_alarm_monitor_toolbar_clearShowMaxNum";
			
			console.log("initialize");
		},
		
		events: {
			"click #toggleBtn": "cleanGridHideToggleEvent"
		},
		
		_beforeRender:function(){
			console.log("_beforeRender");	
		},
		
		beforeRender:function(){
			console.log("beforeRender");
		},
		
		/*render:function(){
			console.log("render");
		},*/
		
		//这里用来进行dom操作
		_render: function() {
			console.log("_render");
			this.$el.html(this.template(this.i18nData));	
			this.$el.css({
				"height" : "100%"
			});
			return this;
		},
		
		/*afterRender:function(){
			console.log("afterRender");
		},*/
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.layout();
			this.initToolbar();
			this.initAlarmMonitorGrid();
			
			//连接WebSocket
			monitorWS.register(this.produceAlarmService, this.refleshAlarmStatistics);//注册回调函数 //TODO:后续改为promise
			monitorWS.initConnect({onOpen:function(){
				var filter = {}; //过滤器参数值
				monitorWS.sendMessage(JSON.stringify(filter));//启动告警统计推送服务
			}}); 
			
			this.registerWebSocket(monitorWS.getSocket());
			this.costAlarmService();
			console.log("_afterRender");
		},
		
		initToolbar:function(){
			
			this.loadSearchFilter();
			
			this.$('#' + this.newGridShowMaxNumId+ ',#' + this.historyGridShowMaxNumId).combobox({
		        dataTextField: 'text',
		        dataValueField: 'value',
		        editable:false,
		        dataSource: alarmListShowMaxNum,
		        change:function(){
		        	var value = $(this).combobox('value');
		        	console.log("info:" + $(this).combobox('value'));
		        	if(arguments[0].target.id == currentObj.newGridShowMaxNumId){
		        		showPageRowNum = value;
		        		//$("#alarmAddGrid").monitorgrid('clearData');
		        	}else if(arguments[0].target.id == currentObj.historyGridShowMaxNumId){
		        		clearAlarmRowNumber = value;
		        		//$("#alarmClearGrid").monitorgrid('clearData');
		        	}
		        }
		    });
			
			this.$("#" + this.monitorSwitchId).prop("checked", true).click(function() {
				if($(this).is(":checked")){
					monitorWS.sendMessage(JSON.stringify({type:'runStatus', running:true}));
				}else{
					monitorWS.sendMessage(JSON.stringify({type:'runStatus', running:false}));
				}
			});
			
			//再次确认启动监控
			var isMonite = this.$("#" + this.monitorSwitchId).is(":checked");
			if(!isMonite){
				this.$("#" + this.monitorSwitchId)[0].checked=true;
			}
		},
		
		/**
		 * 初始化告警监控Grid
		 */
		initAlarmMonitorGrid:function(){
			$("#alarmAddGrid, #alarmCleanGrid").monitorgrid({
				fit:true,
				idField:"id"
				,onDblClickRow:function(rowIndex, rowData){
					currentObj.openAlarmDetailDialog(rowData);
				}
			});
		},
		
		openAlarmDetailDialog:function(selectRow){
			var pop =fish.popupView({url: 'modules/nms/alarm/views/alarmDetailsList',
				viewOption:{rowData:selectRow},
				width: "65%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		/**
		 * 隐藏历史告警Grid事件
		 */
		cleanGridHideToggleEvent:function(){
			//检查是否展开
			var isExpand =  this.$el.find("#toggleBtn").hasClass("fa-angle-double-down");
			if(isExpand){
				$("#alarmCleanArea").hide();
				//TODO:增加特效 
				$("#toggleBtn").removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
				$("#alarmAddArea").height(centerPanelHeight);			
			}else{
				$("#alarmCleanArea").show();
				$("#toggleBtn").removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
				$("#alarmAddArea").height(centerPanelHeight/3*2);
			}
			$("#alarmAddGrid").monitorgrid('setSize');
		},	
		
		//添加告警数据到js队列,该方法由websocket消息后立即调用
		produceAlarmService : function(data) {
			for (var i = 0; i < data.length; i++) {
				queueData.push(data[i]);
				receiveAlarmCount += 1;
				//$("#receiveAlarmCount").textbox('setText', receiveAlarmCount);
			}		
		},
		
		//消费告警队列
		costAlarmService : function() {
			if (timerId) {
				clearTimeout(timerId);
			}
			var alarms = [];
			for(var i = queueCostSize; i > 0; i--){
				if (queueData.length > 0) {
					alarms.push(queueData.shift());
				} else {
					break;
				}
			}
			currentObj.handlerAlarmData(alarms);
			timerId = setTimeout(currentObj.costAlarmService, queueCostTime);
		},		
		
		// 处理推送过来的数据
		handlerAlarmData:function(alarms) {
			var i;
			var j= 0;
			var addBData = []; //新增告警批量处理的数据
			var clearData = []; //清除告警批量处理的数据
			for(i = alarms.length; i >0; i--){
				var alarm = alarms[j++];
				if(!alarm.action) continue;
				if (alarm.createTime) {
					alarm.createTime = alarm.createTime.replace("+", " ");
				}
				if (alarm.action == "add") {
					addBData.push(alarm);
					if(addBData.length == batchInsertSize){
						currentObj.addAlarmData(addBData);
						addBData = [];
					}
				}else if(alarm.action == "clear"){
					clearData.push(alarm);
					if(clearData.length == batchInsertSize){
						currentObj.clearAlarmData(clearData);
						clearData=[];
					}
				}
			}
			currentObj.addAlarmData(addBData);
			currentObj.clearAlarmData(clearData);
		},
		
		// 推送添加
		addAlarmData : function(alarms) {
			/*if($("#alarmAddGrid").monitorgrid('exist', alarm["alarmInstanceId"])){
				return;
			}*/
			$("#alarmAddGrid").monitorgrid('insertRow', alarms);
			while(true){
				if($("#alarmAddGrid").monitorgrid('getTotal') <= showPageRowNum){
					break;
				}
				$("#alarmAddGrid").monitorgrid('deleteRow');
			}		
		},
		
		// 清除列表数据
		clearAlarmData:function(alarms) {
			$.each(alarms, function(index, alarm){
				if($("#alarmAddGrid").monitorgrid('exist', alarm["id"])){
					$("#alarmAddGrid").monitorgrid('deleteRow', alarm["id"]);
				}
			});
			/*if($("#alarmCleanGrid").monitorgrid('exist', alarm["alarmInstanceId"])){
				return;
			}*/
			$("#alarmCleanGrid").monitorgrid('insertRow', alarms);
			while(true){
				if($("#alarmCleanGrid").monitorgrid('getTotal') <= clearAlarmRowNumber){
					break;
				}
				$("#alarmCleanGrid").monitorgrid('deleteRow');
			}
		},
		
		//刷新告警统计信息
		refleshAlarmStatistics : function(statInfo) {
			if(!statInfo) return;
			
			if(!statInfo.unknowAlarm) statInfo.unknowAlarm = 0;
			if(!statInfo.promptAlarm) statInfo.promptAlarm = 0;
			if(!statInfo.minorAlarm) statInfo.minorAlarm = 0;
			if(!statInfo.importantAlarm) statInfo.importantAlarm = 0;
			if(!statInfo.emergencyAlarm) statInfo.emergencyAlarm = 0;
			if(!statInfo.total) statInfo.total = 0;
			
			currentObj.$el.find("#nms_alarm_monitor_emergencyAlarm").text(statInfo.emergencyAlarm);
			currentObj.$el.find("#nms_alarm_monitor_importantAlarm").text(statInfo.importantAlarm);
			currentObj.$el.find("#nms_alarm_monitor_minorAlarm").text(statInfo.minorAlarm);
			currentObj.$el.find("#nms_alarm_monitor_promptAlarm").text(statInfo.promptAlarm);
			currentObj.$el.find("#nms_alarm_monitor_unknowAlarm").text(statInfo.unknowAlarm);
			

			//$("#total").text(statInfo.total);
		},
		
		//清除告警列表数据
		clearGridData:function(){
			while(true){
				if($("#alarmAddGrid").monitorgrid('getTotal') <= 0){
					break;
				}
				$("#alarmAddGrid").monitorgrid('deleteRow');
			}
			while(true){
				if($("#alarmCleanGrid").monitorgrid('getTotal') <= 0){
					break;
				}
				$("#alarmCleanGrid").monitorgrid('deleteRow');
			}
		},
		
		/**
		 * 加载过滤器标签
		 */
		loadSearchFilter:function(){
			utils.ajax("searchFilterService", "queryFilter", filterCatalogId).done($.proxy(function(data){
				//默认过滤器，无过滤参数
				var defaultFilterLabelDIV = $('<div class="toolbar-label toolbar-label-select-bg"></div>').text("全部").attr("filterId",-1);
				this.$("#nms_alarm_monitor_filterLabel").append(defaultFilterLabelDIV);
				
				$.each(data, $.proxy( function(index, filter){
					//console.log(filter.name + ":" + filter.id);
					var filterLabelDIV = $('<div class="toolbar-label"></div>').text(filter.name).attr("filterId",filter.id);
					this.$("#nms_alarm_monitor_filterLabel").append(filterLabelDIV);
				} ,this));
				this.$("#nms_alarm_monitor_filterLabel").children().bind("click", this.filterLabelHandler);
				
			},this));
		},
		
		/**
		 * 过滤器标签操作函数
		 */
		filterLabelHandler:function(){
			currentObj.$("#nms_alarm_monitor_filterLabel").children().removeClass("toolbar-label-select-bg");
			$(this).addClass("toolbar-label-select-bg");
			
			var currentFilterId = $(this).attr("filterId");
			if(currentFilterId == -1){
				monitorWS.sendMessage(JSON.stringify({}));
			}else{
				//查询过滤器参数值
				utils.ajax("searchFilterService", "queryFilterParamInstance", currentFilterId).done(function(data){
					var params = {};
					$.each(data, function(index, paramInst){
						params[paramInst.paramCode] = paramInst.paramValue;
					})
					monitorWS.sendMessage(JSON.stringify(params));
				});
			}
		},
		
		resize:function(){
			if(!resizeLock){
				resizeLock = true;
				currentObj.layout();
				
				setTimeout(function(){
					resizeLock = false;
				} , 500);
			}
		},
		
		layout:function(){
			//计算屏幕高度
			availableHeight = this.$el.height() - 3;
			centerPanelHeight = availableHeight - 32 - 28;//这里的32px是toolbar的高度; 28px：是第二个grid title的高度
			$("#alarmAddArea").height(centerPanelHeight/3*2);
			$("#alarmCleanArea").height(centerPanelHeight/3*1);
		}
	});
});