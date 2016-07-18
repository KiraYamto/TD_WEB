define([ 'text!modules/nms/monitorHomePage/templates/alarmCPUStatistics.html',
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
			this.initCPUEcharts();
			console.log("_afterRender");
		},

		layout:function(){
			var height = this.$el.parent().height();
			$("#nms_alarmCPU_echart").height(height-56);
//			$("#nmsalarmTypeImg").attr("src", "<%=basePath%>/../resources/images/idc/treeNode/room.png");
		},
		
		/*
		 * alarmCPUdata数据格式：[,,,,]
		 */
		initCPUEcharts:function(alarmCPUdata){
		    myChart = echarts.init(document.getElementById('nms_alarmCPU_echart'));
		    alarmCPUdata=[
		                  {value:130, name:'设备5'},
		                  {value:150, name:'设备4'},
		                  {value:170, name:'设备3'},
		                  {value:180, name:'设备2'},
		                  {value:190, name:'设备1'}        
		     ];
            //计算最大值
			var max=undefined;
			var diffList=new Array();
			var alarmCPUX=new Array();		
			if(alarmCPUdata.length>0){
				max=alarmCPUdata[0];
			};
			$.each(alarmCPUdata,function(i,data){				
				if(eval(data.value)>eval(max.value)){
					max=data;
				};
				alarmCPUX.push(data.name);
			});
			//每条记录的告警级别数量与最大值之差
			
			$.each(alarmCPUdata,function(i,data){				
                 var diffValue=eval(max.value)-eval(data.value);
                 diffValue=eval(diffValue+10);
                 diffList.push(diffValue);
			});	
			
		    option = {
		    	    tooltip : {
		    	        trigger: 'axis',
		    	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
		    	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		    	        },
		    	        formatter:"{a0} <br/>{b0} : {c0}"
		    	    },
		    	 
		    	    grid: {
		    	        left: '2%',
		    	        right: '1%',
		    	        bottom: '3%',
		    	        top:'5%',
		    	        containLabel: true
		    	    },
		    	    xAxis : [
		    	        {
		    	            type : 'value',
		    	            max:'dataMax'
		    	        }
		    	    ],
		    	    yAxis : [
		    	        {
		    	            type : 'category',
		    	            axisTick : {show: false},
		    	            axisLabel:{show:true,interval:0,margin:15},
		    	            data :alarmCPUX 
		    	        }
		    	    ],
		    	    
		    	    series : [
		    	        {
		    	            name:'物理机CPU占用率',
		    	            type:'bar',
		    	            stack:'alarmCPU',
		    	           
	        	            itemStyle:{normal:{color:'#DD0000',shadowBlur:{
	        	                 shadowColor: 'rgba(0, 0, 0, 0.5)',
	        	                 shadowBlur: 10
	        	            },
	        	                opacity:1
	        	            }},
		    	            label: {
		    	                normal: {
		    	                    show: true,
		    	                    position: 'inside'
		    	                }
		    	            },
		    	            data:alarmCPUdata
		    	        },
	        	        {
	        	            name:'总量',
	        	            type:'bar',
	        	            stack:'alarmCPU',
	        	            barWidth:15,
	        	            barGap:30,
	        	            itemStyle:{normal:{color:'#F8CCCC',shadowBlur:{
	        	                 shadowColor: 'rgba(0, 0, 0, 0.5)',
	        	                 shadowBlur: 10
	        	            },
	        	                opacity:1
	        	            }},
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
			this.initCPUEcharts();
		}
	
	});
});