define([ 'text!modules/common/sysmonitor/templates/alarmStatisWrap.html',
		'i18n!modules/common/sysmonitor/i18n/SysMonitor.i18n',
		'modules/common/cloud-utils'], 
		function(viewTpl, i18n,utils) {

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {

		},
		initialize : function() {

		},
		// 这里用来进行dom操作
		_render : function() {
			this.$el.html(this.template(this.i18nData));
			this.$el.css({
				"height" : "100%",
				"width" : "100%"
			});

			return this;
		},
		_afterRender : function() {
			var h = this.$(".sysmonitorwidget-alarmmonitor-main")
					.height()
					- 30
					- this.$(".sysmonitorwidget-alarmmonitor-error-body")
							.outerHeight();
			this.$(".sysmonitorwidget-alarmmonitor-bussinessiom-body")
					.height(h + "px");
			this.$(".sysmonitorwidget-alarmmonitor-netdev-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-netdev")
							.width() / 2 - 25)
							+ "px");

			this.$(".sysmonitorwidget-alarmmonitor-host-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-host")
							.width() / 2 - 25)
							+ "px");

			this.$(".sysmonitorwidget-alarmmonitor-netmonitor-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-netmonitor")
							.width() / 2 - 25)
							+ "px");

			this.initAlarmStatisChart();
			this.thread($.proxy(this.generateData,this),1000 * 60 * 2);
		},
		initAlarmStatisChart : function(alarmTypedata) {
			
			 var alarmTypeX=new Array();	
			if(!alarmTypedata || alarmTypedata.length <= 0){
				 alarmTypedata= [{value:335, name:'内存告警'},
				                 {value:310, name:'CPU告警'},
				                 {value:234, name:'网络中断'},
				                 {value:135, name:'主机宕机'},
				                 {value:1548, name:'磁盘告警'},
				                  {value:154, name:'未定义告警'} ];
				 $.each(alarmTypedata,function(i,data){			
				    alarmTypeX.push(data.name);
				 });	
			}
			this.alarmStatisChart = echarts.init(this.$(".sysmonitorwidget-alarmmonitor-bussinessiom-body").get(0));
			this.chartOptions = {
				    title:{
				        text:'告警类型统计',
				        /*subtext:'百分比',*/
						textStyle : {
							fontSize : 18,
							fontWeight : 'normal',
							fontFamily : 'Microsoft Yahei',
							color:'#f6f6f6'
						},
				        left:'5%',
				        y:'top'
				    },
				    tooltip: {
				        trigger: 'item',
				        position:'top',
				      
				        formatter: "{a} <br/>{b}: {c} ({d}%)"
				    },
				    legend: {
				        orient: 'vertical',
			    		x: '75%',
				        y:'center',
				        data:alarmTypeX,
				        itemHeight:20,
						textStyle : {
							color:'#f6f6f6'
						}
				    },
				    series: [
				        {
				            name:'告警类型',
				            type:'pie',
				            radius: ['35%', '55%'],
				            avoidLabelOverlap: false,
				            center: ['36%', '55%'],//设定饼图中心点位置
				            label: {
				                normal: {
				                    show: true,
				                    position: 'outside',
				                    formatter:'{d}%',
				                    textStyle:{
				                    	fontSize:14
				                    }
				                },
				                emphasis: {
				                    show: false,
				                    textStyle: {
				                        fontSize: '12',
				                        fontWeight: 'bold'
				                    }
				                }
				            },
				            labelLine: {
				                normal: {
				                    show: true,
				                    length:2,
				                    length2:2
				                }
				            },
				            itemStyle :　{
					            normal:{//默认样式
					              label : {
					                show : true
					              }
					            }
				            },
				            
				            color:['#E70137','#E78301','#E7C401','#98E701','#6596D5','#25D276'],
				            data:[
				                {value:335, name:'内存告警'},
				                {value:310, name:'CPU告警'},
				                {value:234, name:'网络中断'},
				                {value:135, name:'主机宕机'},
				                {value:1548, name:'磁盘告警'},
				                 {value:154, name:'未定义告警'}
				            ]
				            //data:alarmTypedata
				        }
				    ]
				};
			   // 使用刚指定的配置项和数据显示图表。
			   this.alarmStatisChart.setOption(this.chartOptions);
		},
		
		generateData: function() {
			var minValue = 10;
			var maxValue = 15;
			
			//生成EMS告警数量
			var networkEquiCount = parseInt(Math.random()*(maxValue-minValue+1)+minValue);
			var hostCount = parseInt(Math.random()*(maxValue-minValue+1)+minValue);
			var powerCount = parseInt(Math.random()*(maxValue-minValue+1)+minValue);
			
			this.$el.find(".sysmonitorwidget-alarmmonitor-netdev-num").text(networkEquiCount);
			this.$el.find(".sysmonitorwidget-alarmmonitor-host-num").text(hostCount);
			this.$el.find(".sysmonitorwidget-alarmmonitor-netmonitor-num").text(powerCount);
			
			//生成告警类型数据
			var alarmData = [
			    {value: (335 +Math.ceil(Math.random()*10)), name:'内存告警'},
			    {value: (310 + Math.ceil(Math.random()*10)), name:'CPU告警'},
			    {value: (234 + Math.ceil(Math.random()*10)), name:'网络中断'},
			    {value: 135 + Math.ceil(Math.random()*10), name:'主机宕机'},
			    {value: 1548 + Math.ceil(Math.random()*10), name:'磁盘告警'},
			    {value: 154 + Math.ceil(Math.random()*10), name:'未定义告警'} 
             ];
			this.chartOptions.series[0].data = alarmData;
			this.chartOptions.series[0].labelLine= {normal: {show: false}};
			
			this.alarmStatisChart.setOption(this.chartOptions);
		},

		resize : function() {
			var h = this.$(".sysmonitorwidget-alarmmonitor-main")
					.height()
					- 30
					- this.$(".sysmonitorwidget-alarmmonitor-error-body")
							.outerHeight();
			this.$(".sysmonitorwidget-alarmmonitor-bussinessiom-body")
					.height(h + "px");

			this.$(".sysmonitorwidget-alarmmonitor-netdev-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-netdev")
							.width() / 2 - 25)
							+ "px");

			this.$(".sysmonitorwidget-alarmmonitor-host-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-host")
							.width() / 2 - 25)
							+ "px");

			this.$(".sysmonitorwidget-alarmmonitor-netmonitor-con").css(
					"top",
					(this.$(".sysmonitorwidget-alarmmonitor-netmonitor")
							.width() / 2 - 25)
							+ "px");

			this.alarmStatisChart.resize();
		}
	});
});