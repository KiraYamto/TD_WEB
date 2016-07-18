define([ 'text!modules/nms/monitorHomePage/templates/alarmTypeStatistics.html',
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
			this.initEcharts();
			console.log("_afterRender");
		},

		layout:function(){
			//var height=$("#nms_monitor_statis_2").height();
			var height = this.$el.parent().height();
			
			$("#nms_alarmType_echart").height(height-30);
//			$("#nmsalarmTypeImg").attr("src", "<%=basePath%>/../resources/images/idc/treeNode/room.png");
		},
		
		/*
		 * '内存告警','CPU告警','网络中断','主机宕机','磁盘告警','未定义告警'
		 */
		initEcharts:function(alarmTypedata){
		    myChart = echarts.init(document.getElementById('nms_alarmType_echart'));

		    alarmTypedata= [
             {value:20, name:'内存告警'},
             {value:15, name:'CPU告警'},
             {value:12, name:'网络中断'},
             {value:25, name:'主机宕机'},
             {value:22, name:'磁盘告警'},
              {value:18, name:'未定义告警'}
            ];
			var alarmTypeX=new Array();			

			$.each(alarmTypedata,function(i,data){			
				
				alarmTypeX.push(data.name);
			});

			option = {
				    title:{
				        text:'告警类型',
				        subtext:'百分比',
				        textStyle:{color:'#3085D2',fontSize:13},
				        subtextStyle:{color:'#FF013D',fontSize:16},
				        left:'12%',
				        y:'center'
				    },
				    tooltip: {
				        trigger: 'item',
				        position:'top',
				      
				        formatter: "{a} <br/>{b}: {c} ({d}%)"
				    },
				    legend: {
				        orient: 'vertical',
//				        x: 'center',
				        right:'1%',
				        y:'center',
				        
				        data:alarmTypeX
				    },
				    series: [
				        {
				            name:'告警类型',
				            type:'pie',
				            radius: ['50%', '70%'],
				            avoidLabelOverlap: false,
				            center: ['20%', '50%'],//设定饼图中心点位置
				            label: {
				                normal: {
				                    show: false,
				                    position: 'outside',
				                    formatter:'{b}:{d}%'
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
				                    formatter: '{b} : {c} ({d}%)' 
				                }
				            },
				            itemStyle :　{

				            normal:{//默认样式
				              label : {
				                show : true}
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
		     myChart.setOption(option);
		},
		
		resize: function() { 
			myChart.resize();
		},
		
		hide:function(){
			myChart.clear();
		},
		
		show:function(){
			this.initEcharts();
		}
	});
});