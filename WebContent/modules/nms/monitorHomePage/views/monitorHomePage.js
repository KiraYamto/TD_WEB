define([
	'text!modules/nms/monitorHomePage/templates/monitorHomePage.html',
	'i18n!modules/nms/monitorHomePage/i18n/monitor.i18n',
	'modules/common/cloud-utils',
	'css!modules/nms/monitorHomePage/styles/monitorHomePage.css'
], function(viewTpl, i18n, utils, css) {
	var currentObj;
	var availableHeight;
	var currentStatisType = 1;
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
			console.log("initialize");
		},
		
		events: {
			"click #nms_monitor_staticType_alarm": "statisTypeEvent",
			"click #nms_monitor_staticType_pf": "statisTypeEvent"
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
			return this;
		},
		
		/*afterRender:function(){
			console.log("afterRender");
		},*/
		
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.layout();
			this.initToolbar();
			this.loadWidgets();
			//$("#nms_monitor_staticType").css("background-color", "#FFFFFF");
			console.log("_afterRender");
			/*this.toggleWidget(1);*/
		},
		
		layout:function(){
			//计算屏幕高度
			availableHeight = $(document.body).height() - utils.getHeadHeight(); //页面可用高度
			$("#nms_monitor_monitorMap").height(availableHeight-2 - 32 - 20); //2px:底边距 ;32px：是地图上面工具栏的高度
			$("#nms_monitor_statisArea").height(availableHeight-2);
			
			//计算统计区域宽高值
			var statisHeight = $("#nms_monitor_statisArea").height();
			var statisWidth = $("#nms_monitor_statisArea").width();
		
			var alarmCountHeight = 107; //告警数量显示区高度
			
			var statisAvailableHeight = statisHeight - alarmCountHeight - 80; //80px:3个统计区域的间距之和
			$("#mms_monitor_alarmCount").height(alarmCountHeight);
			$("#nms_monitor_statis_1").height(statisAvailableHeight/2); 
			$("#nms_monitor_statis_2").height(statisAvailableHeight/2);
			
			//计算性能统计图表的高度
			var pfStatisAvailableHeight = statisHeight - 60;
			$("#nms_monitor_statis_3").height(pfStatisAvailableHeight/2); 
			$("#nms_monitor_statis_4").height(pfStatisAvailableHeight/2);
		},
		
		initToolbar:function(){
			
			/*$('#nms_monitor_staticType').combobox({
		        dataTextField: 'label',
		        dataValueField: 'value',
		        editable:false,
		        value:1,
		        dataSource: [
		          {value:1, label:'告警监控'}
		         ,{value:2, label:'性能监控'}
		        ]
		    });*/
			
			
		},
		
		loadWidgets:function(){
			loadWidgetModule = $.proxy(this.loadWidgetModule,this);

			var widgets=[
			  {viewId:'#nms_monitor_monitorMap', moduleUrl:"modules/nms/monitorHomePage/views/alarmMap", opts:{}} 
			  ,{viewId:'#mms_monitor_alarmCount', moduleUrl:"modules/nms/monitorHomePage/views/alarmCountStatis", opts:{}}
			  ,{viewId:'#nms_monitor_statis_1', moduleUrl:"modules/nms/monitorHomePage/views/alarmLevelStatistics", opts:{}}
			  ,{viewId:'#nms_monitor_statis_2', moduleUrl:"modules/nms/monitorHomePage/views/alarmTypeStatistics", opts:{}} 
			  ,{viewId:'#nms_monitor_statis_3', moduleUrl:"modules/nms/monitorHomePage/views/alarmCPUStatistics", opts:{}}
			  ,{viewId:'#nms_monitor_statis_4', moduleUrl:"modules/nms/monitorHomePage/views/alarmPortStatistics", opts:{}} 			
			 ];
//			var widgets=[
//				  {viewId:'#mms_monitor_alarmCount', moduleUrl:"modules/nms/monitorHomePage/views/alarmCountStatis", opts:{}}
//				 ,{viewId:'#nms_monitor_statis_1', moduleUrl:"modules/nms/monitorHomePage/views/alarmCPUStatistics", opts:{}}
//				 ,{viewId:'#nms_monitor_statis_2', moduleUrl:"modules/nms/monitorHomePage/views/alarmTypeStatistics", opts:{}} 
//				 ,{viewId:'#nms_monitor_monitorMap', moduleUrl:"modules/nms/monitorHomePage/views/alarmMap", opts:{}} 
//			 ];
			$.each(widgets, function(index, widget){
				loadWidgetModule(widget.viewId, widget.moduleUrl, widget.opts);
			});
		},
		
		loadWidgetModule:function(viewId,moduleUrl,widget){
			this.requireView({
				selector : viewId,
				url : moduleUrl,
				viewOption : {
					widget : widget
				}
			}).done(function(){
				//currentObj.onMessage();
				
			});
		},
		
		onMessage:function(data){
			//alert("hello");
			//currentObj.__manager__.views["#mms_monitor_alarmCount"].setAlarmCouont(999);
		},
		
		statisTypeEvent:function(p1){

			var statisType = $('input[name="monitorStaticType"]:checked').val();
			///alert("currentStatisType:" + currentStatisType + "; statisType:" + statisType);
			if(currentStatisType ==statisType) return;
			currentStatisType = statisType;
			
			
			if(statisType && statisType == 1){
				//加载告警
				this.toggleWidget(statisType);
			}else{
				//加载性能
				this.toggleWidget(statisType);
			}
		},
		
		toggleWidget:function(type){
			if(type == 1){
				this.$el.find(".alarmStatis").show();
				currentObj.__manager__.views["#nms_monitor_statis_1"].show();
				currentObj.__manager__.views["#nms_monitor_statis_2"].show();
				
				this.$el.find(".pfStatis").hide();
			}else if(type == 2){
				this.$el.find(".alarmStatis").hide();
				this.$el.find(".pfStatis").show();
				currentObj.__manager__.views["#nms_monitor_statis_3"].show();
				currentObj.__manager__.views["#nms_monitor_statis_4"].show();
			}
		},
		
		resize:function(){
			//var myChart = echarts.getInstanceByDom(document.getElementById('nmsAlarmMapChart'));
			//myChart.resize();
		}
	});
});