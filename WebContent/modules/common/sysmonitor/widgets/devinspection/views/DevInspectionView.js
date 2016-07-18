define([ 'text!modules/common/sysmonitor/widgets/devinspection/templates/DevInspectionView.html',
		'i18n!modules/common/sysmonitor/i18n/SysMonitor.i18n',
		'modules/common/cloud-utils'], 
		function(viewTpl, i18n,utils) {

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			
		},
		initialize : function() {
			this.color='#f6f6f6';
		},
		// 这里用来进行dom操作
		_render : function() {
			this.$el.html(this.template(this.i18nData));
			this.$el.css({
				"height":"100%",
				"width":"100%"
			});
			
			return this;
		},
		_afterRender:function(){
			if(!$('body').hasClass('lightoff')){
				this.color='#404040';
			}
			this.initDevInspeChart();
			
			this.devInspeOption.xAxis[0].data = [fish.dateutil.format(fish.dateutil.addDays(new Date(),-6),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-5),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-4),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-3),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-2),"m-dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-1),"m-dd"),fish.dateutil.format(new Date(),"m-dd")];
			this.devInspeOption.series[0].data = [ 134, 190, 130, 110, 133, 110, 110];//云主机
			this.devInspeOption.series[1].data = [ 94, 100, 40, 70, 30, 63, 50];//物理机
			this.devInspeOption.series[2].data = [ 54, 65, 20, 10, 10, 33, 10];//IDC
			
			if(!$('body').hasClass('lightoff')){
				//this.devInspeOption.xAxis[0].data = [];
				this.devInspeOption.series[0].data = [0,0,0,0,0,0,0];
				this.devInspeOption.series[1].data = [0,0,0,0,0,0,0];
				this.devInspeOption.series[2].data = [0,0,0,0,0,0,0];
			}
			
			this.devInspeChart.setOption(this.devInspeOption);
			//this.thread($.proxy(this.generateData,this),2000);
		},initDevInspeChart: function() {
			this.devInspeChart = echarts.init(this.$(".sysmonitorwidget-devinspe-body").get(0), 'macarons');
			this.devInspeOption = {
					color: ['#08EE4F','#FF9000','#877E72'],
					title: {
						show: true,
						text: '设备巡检',
						x: 'left',
						y: 'top',
						padding: [6,0,6,15],
						textAlign: 'left',
						textStyle: {
							fontSize: 18,
							fontWeight: 'normal',
							fontFamily: 'Microsoft Yahei',
							color:this.color
						}
					},
				    tooltip : {
				        trigger: 'axis'
				    },
				    grid : {
				    	left: '15px',
	        	        right: '20px',
	        	        bottom: '5px',
	        	        top:'40px',
	        	        containLabel: true
				    },
				    legend: {
				    	orient : 'horizontal',
				    	x: 'right',
				    	padding: [11,15,11,0],
				        itemGap: 3,
				        data:['正常','异常','失联'],
						textStyle : {
							color:this.color
						}
				    },
				   /* toolbox: {
				        show : true,
				        padding: [5,18,5,5],
				        feature : {
				            dataView : {show: true, readOnly: false},
				            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
				            restore : {show: true},
				            saveAsImage : {show: true}
				        }
				    },*/
				    xAxis : [
				        {
				            type : 'category',
				            //boundaryGap : false,
				            data : [],
							axisLine:{
								lineStyle:{
									color:'#A7AAAE'
								}
							},
							axisLabel:{
								textStyle : {
									color:this.color
								}
								
							},splitLine: {
								lineStyle: {
									
									color:'#636A73',
									type:'dotted'
								}
								
							}
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
							axisLine:{
								lineStyle:{
									color:'#A7AAAE'
								}
							},
							axisLabel:{
								textStyle : {
									color:this.color
								}
								
							},splitLine: {
								lineStyle: {
									
									color:'#636A73',
									type:'dotted'
								}
								
							}
				        }
				    ],
				    series : [
				        {
				            name:'正常',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data: []
				        },
				        {
				            name:'异常',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data: []
				        },
				        {
				        	name:'失联',
				        	type:'line',
				        	symbol: 'circle',
				        	symbolSize: 7,
				        	data: []
				        }
				    ]
				};
		},generateData: function() {
			var isNA = Math.ceil(Math.random()*10);
			var num = Math.ceil(Math.random()*10);
			if(isNA>5){
				this.devInspeOption.series[0].data[9] = this.devInspeOption.series[0].data[9] + num;
				
			}else{
				var tm = this.devInspeOption.series[0].data[9] + num*-1;
				if(tm>2){
					this.devInspeOption.series[0].data[9]=tm;
				}
				else{
					this.devInspeOption.series[0].data[9] = this.devInspeOption.series[0].data[9] + num;
					
				}
			}
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*10);
			
			if(isNA>5){
				this.devInspeOption.series[1].data[9] = this.devInspeOption.series[1].data[9] + num;
				
			}else{
				var tm = this.devInspeOption.series[1].data[9] + num*-1;
				if(tm>2){
					this.devInspeOption.series[1].data[9]=tm;
				}
				else{
					this.devInspeOption.series[1].data[9] = this.devInspeOption.series[1].data[9] + num;
					
				}
			}
			
			isNA = Math.ceil(Math.random()*10);
			num = Math.ceil(Math.random()*10);
			

			if(isNA>5){
				this.devInspeOption.series[2].data[9] = this.devInspeOption.series[2].data[9] + num;
				
			}else{
				var tm = this.devInspeOption.series[2].data[9] + num*-1;
				if(tm>2){
					this.devInspeOption.series[2].data[9]=tm;
				}
				else{
					this.devInspeOption.series[2].data[9] = this.devInspeOption.series[2].data[9] + num;
					
				}
			}
			
			this.devInspeChart.setOption(this.devInspeOption);
			
		},
		resize:function(){
			
			this.devInspeChart.resize();
			
		}
	});
});





