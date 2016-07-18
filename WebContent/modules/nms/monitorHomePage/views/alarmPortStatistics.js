define([ 'text!modules/nms/monitorHomePage/templates/alarmPortStatistics.html',
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
			$("#nms_alarmPort_echart").height(height-56);
//			$("#nmsalarmTypeImg").attr("src", "<%=basePath%>/../resources/images/idc/treeNode/room.png");
		},
		
		/*
		 * alarmCPUdata数据格式：从小到大排序
		 */
		initCPUEcharts:function(alarmPortdata){
		    myChart = echarts.init(document.getElementById('nms_alarmPort_echart'));
		    alarmPortdata=[
		                  {value:500, name:'端口5'},
		                  {value:1000, name:'端口4'},
		                  {value:2000, name:'端口3'},
		                  {value:3600, name:'端口2'},
		                  {value:4100, name:'端口1'}        
		     ];
            //计算最大值
			var max=undefined;
			var maxDiff=undefined;//最大相互差值
			var diffList=new Array();
			var alarmPortX=new Array();		
			if(alarmPortdata.length>1){
				max=alarmPortdata[0].value;
				maxDiff=eval(alarmPortdata[1].value)-eval(alarmPortdata[0].value);
			};
			$.each(alarmPortdata,function(i,data){				
				if(eval(data.value)>eval(max)){
					max=data.value;
				};
				if(i+1<alarmPortdata.length){
					var diffValue=eval(alarmPortdata[i+1].value)-eval(data.value);
			        if(eval(diffValue)>eval(maxDiff)){
			        	maxDiff=diffValue;
			        };
				}
				alarmPortX.push(data.name);
			});
			//每条记录的告警级别数量与最大值之差
			max=eval(maxDiff)+eval(max);
			$.each(alarmPortdata,function(i,data){				
                 var diffValue=eval(max)-eval(data.value);
                 
                 diffList.push(diffValue);
			});	
			
		    option = {
		    	    tooltip : {
		    	        trigger: 'axis',
		    	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
		    	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		    	        },
//		    	        formatter:'{a0} <br/>{b0}:{c0}'
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
		    	            data :alarmPortX 
		    	        }
		    	    ],
		    	    
		    	    series : [
		    	        {
		    	            name:'网络设备端口流量占用率',
		    	            type:'bar',
		    	            stack:'alarmPort',
		    	           
	        	            itemStyle:{normal:{color:'#FF7800',shadowBlur:{
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
		    	            data:alarmPortdata
		    	        },
	        	        {
	        	            name:'',
	        	            type:'bar',
	        	            stack:'alarmPort',
	        	            barWidth:15,
	        	            barGap:30,
	        	            itemStyle:{normal:{color:'#FFE4CC',shadowBlur:{
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