define([ 'text!modules/nms/monitorHomePage/templates/resourcePoolStatistics.html',
	'i18n!modules/nms/monitorHomePage/i18n/monitor.i18n', 'modules/common/cloud-utils'
	,'css!modules/common/sysmonitor/styles/rescapacity.css'
	], function(
		viewTpl, i18n, utils,css) {
	     var myChart;		
	     var curFlowIn;
	     var curFlowOut;

		return fish.View.extend({
			template : fish.compile(viewTpl),
			i18nData : fish.extend({}, i18n),
         
			initialize : function() {			
				console.log("initialize");
				
			},

			events : {
				
			},

			_beforeRender : function() {
				console.log("_beforeRender");
			},

			beforeRender : function() {
				console.log("beforeRender");
			},

			_render : function() {
				console.log("_render");
				
				this.$el.html(this.template(this.i18nData));
				this.$el.css({
					"height":"100%",
					"width":"100%"
				});
				return this;
			},

		// 这里用来初始化页面上要用到的fish组件
		_afterRender : function() {
			this.layout();
//			var alarmData=[320, 332, 301, 334, 800];
			curFlowIn=Math.random()*10;
			curFlowOut=Math.random()*10;
			
			
			this.initResourcePoolEcharts();
			this.thread($.proxy(this.generateData,this),1000 * 60 * 2);
			
		},

		layout:function(){
			//$("#nms_alarmLevel_echart").height();
			//var height=$("#nms_monitor_statis_2").height();
			var height = this.$el.parent().height();
			$("#nms_resourcePool_echart").height(height);
		},
		
		/*
		 *
		 */
		initResourcePoolEcharts:function(resourcePoolIndata,resourcePoolOutdata){
			
			this.myChart = echarts.init(this.$('#nms_resourcePool_echart').get(0));
            var fontColor = $('body').hasClass('lightoff')?'#f6f6f6':'#404040';
            
			this.chartOption = {
					color: ['#09E64E','#0470EB'],
					title: {
						show: true,
						text: '资源池流量分析',
						x: 'left',
						y: 'top',
						padding: [5,5,5,10],
						textAlign: 'left',
						textStyle: {
							fontSize : 18,
							fontWeight : 'normal',
							fontFamily : 'Microsoft Yahei',
							color:fontColor
						}
					},
	        	    grid: {
	        	        left: '3%',
	        	        right: '5%',
	        	        bottom: '1%',
//	        	        top:'1%',
	        	        containLabel: true
	        	    },
				    tooltip : {
				        trigger: 'axis'
				    },
				    legend: {
				    	orient : 'horizontal',
				    	x: 'right',
				        itemGap: 15,
				        data:['出平均','入平均'],
				        top:5,
				    	textStyle : {
							color:fontColor
						}
				    },
				    xAxis : [{
				    	type : 'category',
				        boundaryGap : false,
						axisLine:{
							lineStyle:{
								color:'#A7AAAE'
							}
						},
						axisLabel:{
							textStyle : {
								color:fontColor
							}
						 ,show:true,interval:0
						
						},splitLine: {
							lineStyle: {
								color:'#636A73',
								type:'dotted'
							}
						
						},
						
				        data : []
				       }
				    ],
				    yAxis : [{
				            type : 'value',
				            name:'Gbits/天',
				        	axisLine:{
				        		lineStyle:{
									color:'#A7AAAE'
							}},
							axisLabel:{
								textStyle : {
									color:fontColor
							}},splitLine: {
								lineStyle: {
									color:'#636A73',
									type:'dotted'
							}}
				        }],
				    series : [
				        {
				            name:'入平均',
				            type:'line',
				            symbol: 'rect',
				            symbolSize: 7,
				            data: []
				        },
				        {
				            name:'出平均',
				            type:'line',
				            symbol: 'rect',
				            symbolSize: 7,
				            data: []
				        }
				    ]
				};
			this.generateData();
		},
		
		generateData:function(){
	        var today = new Date();      	
	        var yesterday= new Date(today.getTime() - 24*60*60*1000);
	        var twoDayBefore=new Date(yesterday.getTime() - 24*60*60*1000);
	        var threeDayBefore=new Date(twoDayBefore.getTime() - 24*60*60*1000);
	        var fourDayBefore=new Date(threeDayBefore.getTime() - 24*60*60*1000);
	        var fiveDatBefore=new Date(fourDayBefore.getTime() - 24*60*60*1000);
	        var sixDayBefore=new Date(fiveDatBefore.getTime() - 24*60*60*1000);	        
	        //从当前日期至一周前日期时间
	        var curdate = today.getMonth() +1 + "-" + today.getDate(); 
	        var yesterdayDate=yesterday.getMonth() +1 + "-" + yesterday.getDate(); 
	        var twoDayBeforeDate=twoDayBefore.getMonth() +1 + "-" + twoDayBefore.getDate(); 
	        var threeDayBeforeDate=threeDayBefore.getMonth() +1 + "-" + threeDayBefore.getDate();
	        var fourDayBeforeDate=fourDayBefore.getMonth() +1 + "-" + fourDayBefore.getDate();
	        var fiveDatBeforeDate=fiveDatBefore.getMonth() +1 + "-" + fiveDatBefore.getDate();
	        var sixDayBeforeDate=sixDayBefore.getMonth()+1  + "-" + sixDayBefore.getDate();
	        //定义x轴
	        var xAxisData=new Array();
	        xAxisData.push(sixDayBeforeDate);
	        xAxisData.push(fiveDatBeforeDate);
	        xAxisData.push(fourDayBeforeDate);
	        xAxisData.push(threeDayBeforeDate);
	        xAxisData.push(twoDayBeforeDate);
	        xAxisData.push(yesterdayDate);
	        xAxisData.push(curdate);
	        
	        //当前日期的入平均流量
	        curFlowIn= Math.ceil(curFlowIn+0.2);
	        //当前日期的出平均流量
	        curFlowOut= Math.ceil(curFlowOut+0.1);
	        
	        this.chartOption.xAxis[0].data=xAxisData;
			this.chartOption.series[0].data = [
                                              {name:sixDayBeforeDate,value:23},
                                              {name:fiveDatBeforeDate,value:30},
                                              {name:fourDayBeforeDate,value:35},
                                              {name:threeDayBeforeDate,value:30},
                                              {name:twoDayBeforeDate,value:34},
                                              {name:yesterdayDate,value:40},
			     			                  {name:curdate,value: 40 + curFlowIn}
			    			                  ];
			
			
			this.chartOption.series[1].data = [
			                                   {name:sixDayBeforeDate,value:18},
			                                   {name:fiveDatBeforeDate,value:30},
			                                   {name:fourDayBeforeDate,value:27},
			                                   {name:threeDayBeforeDate,value:25},
			                                   {name:twoDayBeforeDate,value:23},
			                                   {name:yesterdayDate,value:35},
			                                   {name:curdate,value: 35 + curFlowOut}
				    			                 ];
			
			this.myChart.setOption(this.chartOption);
		},
		
		resize: function() { 
			this.myChart.resize();
			var h = this.$('.resourcecapacity-title').height();
			this.$('.resourcecapacity-title span').css({"line-height":h+"px"});
		}
		
	
	});
});