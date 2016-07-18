define([ 'text!modules/nms/monitorHomePage/templates/alarmLevelStatistics.html',
	'i18n!modules/nms/monitorHomePage/i18n/monitor.i18n', 'modules/common/cloud-utils' ], function(
		viewTpl, i18n, utils) {
	    var myChart;		

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
				return this;
			},

		// 这里用来初始化页面上要用到的fish组件
		_afterRender : function() {
			this.layout();
//			var alarmData=[320, 332, 301, 334, 800];
			this.initAlarmLevelEcharts();
			console.log("_afterRender");
			
		},

		layout:function(){
			//$("#nms_alarmLevel_echart").height();
			var height=$("#nms_monitor_statis_1").height();
			$("#nms_alarmLevel_echart").height(height-30);
		},
		
		/*
		 *alarmLeveldata
		 */
		initAlarmLevelEcharts:function(alarmLeveldata){
			alarmLeveldata=[{name:'紧急告警',value:18},{name:'重要告警',value:22},{name:'普通告警',value:30}
			,{name:'提示告警',value:18},{name:'未定义告警',value:24}];
			myChart = echarts.init(document.getElementById('nms_alarmLevel_echart'));

            //计算最大值
			var max;
			var diffList=new Array();
			var alarmLevlX=new Array();
			var alarmLevlY=new Array();
			if(alarmLeveldata.length>0){
				max=alarmLeveldata[0];
			};
			$.each(alarmLeveldata,function(i,data){				
				if(eval(data.value)>eval(max.value)){
					max=data;
				};
				alarmLevlX.push(data.name);
				alarmLevlY.push(data.value);
			});
			//每条记录的告警级别数量与最大值之差
			$.each(alarmLeveldata,function(i,data){				
                 var diffValue=eval(max.value)-eval(data.value);
                 diffValue=eval(diffValue+10);
                 diffList.push(diffValue);
			});			
	        var option = {
	        		title:{
	        			text:'告警级别统计',
	        			show:false,
	        			top:'top',
	        			left:'left',
	        			textStyle:{
	        				fontSize:12
	        			}
	        		},
	        	    tooltip : {
	        	        trigger: 'axis',
	        	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	        	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        	        },
	        	        formatter:"{a0} <br/>{b0} : {c0}"
	        	    },
	        	    grid: {
	        	        left: '1%',
	        	        right: '1%',
	        	        bottom: '3%',
	        	        top:'22%',
	        	        containLabel: true
	        	    },
	        	    xAxis : [
	        	        {
	        	            type : 'category',
	        	            axisLabel:{show:true,interval:0},
	        	            data : alarmLevlX
	        	            
	        	        }
	        	    ],
	        	    yAxis : [
	        	        {
	        	            type : 'value',
	        	            name:'单位(次)'
	        	            //splitLine:{show:false}//控制y轴分割线是否显示
	        	        }
	        	    ],
	        	    series : [
	        	        {
	        	            name:'告警级别',
	        	            type:'bar',
	        	            stack:'alarm',
	        	            itemStyle:{normal:{color:'#ED053B',shadowBlur:{
	        	                 shadowColor: 'rgba(0, 0, 0, 0.5)',
	        	                 shadowBlur: 10
	        	            },
	        	                opacity:1
	        	            }},
	        	            label:{
	        	            	normal:{
	        	            		show:true,positon:'left'
	        	            	}
	        	            },
	        	            data:alarmLevlY
	        	        },{ 
	        	        	type:'bar',
	        	            stack:'alarm',
	        	            barWidth:20,
	        	            itemStyle:{
	        	            	normal:{
	        	            		color:'#FBCDD8',
	        	            		shadowBlur:{
	        	            			shadowColor: 'rgba(0, 0, 0, 0.5)',
	        	            			shadowBlur: 10
	        	            		},
	        	            		opacity:1
	        	            	}
	        	            },
	        	            data:diffList
	        	        }
	        	    ]
	        	};


		     // 使用刚指定的配置项和数据显示图表。
		     myChart.setOption(option);
		},
		
		resize: function() { 
			myChart.resize();
		},
		
		hide:function(){
			myChart.clear();
		},
		
		show:function(){
			this.initAlarmLevelEcharts();
		}
	});
});