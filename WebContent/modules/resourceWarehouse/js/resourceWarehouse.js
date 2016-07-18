//echarts图表实例和配置
var alertTypePieChart = -1;
var alertTypePieChartOption = -1;
var alertLevelBarChart = -1;
var alertLevelBarChartOption = -1;
var resourceWarehouseMap = -1;
var resourceWarehouseMapOption = -1;

//地图经纬度map
var geoCoordMap = {
		'大连':[121.62,38.92],
		'沈阳':[123.38,41.8],
		'辽阳市':[123.17,41.28],
		'朝阳县':[120.30,41.37]
};

//开始初始化
$(document).ready(function() { 
	//绑定事件
	$(".resourceWarehouse-radio").click(switchRadio);
	$("#resourceWarehouse-lightModemManage").click(function(){alert('光猫管理');});
	$("#resourceWarehouse-MbhManage").click(function(){alert('魔百和管理');});
	$("#resourceWarehouse-consumablesManage").click(function(){alert('耗材管理');});
	
	//初始化饼图、柱状图
	$(window).resize();
	initAlertTypePieChart();
	initAlertLevelBarChart();
	initResourceWareHouseMap();
	
	//默认选中省资源仓库
	$('input:radio[value=provWarehouseRadio]').click();
}); 

//窗口大小自适应
$(window).resize(function(){
	$('#resourceWarehouse-container').css({height: window.innerHeight*0.95});
	$('#resourceWarehouse-rightPanels').css({'margin-top': $('.resourceWarehouse-radioGroup').height()+16});
	if (alertTypePieChart != -1) {
		alertTypePieChart.resize();
	}
	if (alertLevelBarChart != -1) {
		alertLevelBarChart.resize();
	}
	if (resourceWarehouseMap != -1) {
		resourceWarehouseMap.resize();
	}
});

//初始化告警类型饼图
function initAlertTypePieChart() {
	alertTypePieChart = echarts.init(document.getElementById('resourceWarehouse-alertTypePieChart'), 'macarons');
	alertTypePieChartOption = {
			color: ['#ea421b','#E98324','#EAC130','#96E62D','#6995D4','#26D278'],
			title: {
				show: true,
				text: '告警类型',
				subtext: '0',
				left: '19%',
				top: 'center',
				textAlign: 'center',
				textStyle: {
					fontSize: 18
				},
				subtextStyle: {
					fontSize: 18,
					fontWeight: 'bold'
				},
			},
			tooltip : {
				trigger: 'item',
				formatter: "{b} : {c} ({d}%)",
				position : function(p) {
					// 位置回调
					return [p[0] + 10, p[1] - 10];
				}
			},
			legend: {
				orient : 'vertical',
				left: '50%',
				top: 'center',
		        data:['内存告警','CPU告警','网络中断','主机宕机','磁盘告警','未定义告警'],
		        itemWidth: 30,
		        itemHeight: 20
		    },
		    series : [
		        {
		            type:'pie',
		            center : ['20%', '50%'],
		            radius : ['60%', '80%'],
		            itemStyle : {
		                normal : {
		                    label : {
		                        show : false
		                    },
		                    labelLine : {
		                        show : false
		                    }
		                },
		                emphasis : {
		                    label : {
		                        show : false
		                    }
		                }
		            },
		            data:[]
		        }
		    ]
		};
	
	//加载数据
	var data = [{value:100, name:'内存告警'}, {value:90, name:'CPU告警'},{value:110, name:'网络中断'},
	            {value:30, name:'主机宕机'},{value:400, name:'磁盘告警'},{value:30, name:'未定义告警'}];
	alertTypePieChartOption.series[0].data = data;
	alertTypePieChartOption.title.subtext = calculateTotalValue(data)+'';
	alertTypePieChart.setOption(alertTypePieChartOption);
}

//初始化告警级别柱状图
function initAlertLevelBarChart() {
	alertLevelBarChart = echarts.init(document.getElementById('resourceWarehouse-alertLevelBarChart'), 'macarons');
	alertLevelBarChartOption = {
			color: ['#ea421b'],
		    tooltip : {
		        trigger: 'item'
		    },
		    grid : {
		    	left: '5',
    	        right: '5',
    	        bottom: '10',
    	        top:'10',
    	        containLabel: true
		    },
		    xAxis : [
		        {
		            type : 'category',
		            boundaryGap : true,
		            data : []
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		        }
		    ],
		    series : [
		        {
		            name:'告警',
		            type:'bar',
		            barCategoryGap: '60%',
		            data: []
		        }
		    ]
		};
	
	//加载数据
	alertLevelBarChartOption.xAxis[0].data = ['紧急告警','重要告警','普通告警','提示告警','未定义告警'];
	alertLevelBarChartOption.series[0].data = [18, 22, 30, 18, 24];
	alertLevelBarChart.setOption(alertLevelBarChartOption);
}

//计算饼图数组内数据总值
function calculateTotalValue(data) {
	var totalValue = 0;
	for (i in data) {
		totalValue += data[i].value;
	}
	return totalValue;
}

//切换省、市、区县资源仓库视图
function switchRadio() {
	if ($('input:radio[name=resourceWarehouse-radio]:checked').val() == 'provWarehouseRadio') {
		var data = [
            //value: [告警级别, 告警数量, 告警派单数量]
            {name: '大连', value: [7, 880, 320]},
            {name: '沈阳', value: [2, 80, 20]}
    	];
    	resourceWarehouseMapOption.series[0].data = convertData(data);
    	resourceWarehouseMap.setOption(resourceWarehouseMapOption);
	} 
	else if ($('input:radio[name=resourceWarehouse-radio]:checked').val() == 'cityWarehouseRadio'){
		var data = [
            //value: [告警级别, 告警数量, 告警派单数量]
            {name: '辽阳市', value: [1, 30, 20]}
    	];
    	resourceWarehouseMapOption.series[0].data = convertData(data);
    	resourceWarehouseMap.setOption(resourceWarehouseMapOption);
	} 
	else if ($('input:radio[name=resourceWarehouse-radio]:checked').val() == 'districtWarehouseRadio'){
		var data = [
            //value: [告警级别, 告警数量, 告警派单数量]
            {name: '朝阳县', value: [0, 2, 2]}
    	];
    	resourceWarehouseMapOption.series[0].data = convertData(data);
    	resourceWarehouseMap.setOption(resourceWarehouseMapOption);
	}
}

//初始化地图
function initResourceWareHouseMap() {
	resourceWarehouseMap = echarts.init(document.getElementById('resourceWarehouse-map'), 'macarons');
	resourceWarehouseMapOption = {
			backgroundColor: '#f5f5f5',
			tooltip : {
				trigger: 'item',
				formatter: function(params) {
					return params.name+'<br/><hr/>告警级别：'+params.value[2]+'<br/>告警数量：'+params.value[3]+'<br/>告警派单数量：'+params.value[4];
				}
			},
			geo: {
				map: '辽宁',
				label: {
					emphasis: {
						show: false
					}
				},
				roam: true,
				itemStyle: {
					normal: {
						areaColor: '#323c48',
						borderColor: '#111'
					},
					emphasis: {
						areaColor: '#2a333d'
					}
				}
			},
			series : [
			          {
			        	  name: '资源仓库',
			        	  type: 'effectScatter',
			        	  coordinateSystem: 'geo',
			        	  data: [],
			        	  symbolSize: function(val) {
			                  return 10 + val[2] * 3; //告警级别越高，图标越大
			              },
			        	  showEffectOn: 'render',
			        	  rippleEffect: {
			        		  brushType: 'stroke'
			        	  },
			        	  hoverAnimation: true,
			        	  label: {
			        		  normal: {
			        			  formatter: '{b}',
			        			  position: 'right',
			        			  show: true
			        		  }
			        	  },
			        	  itemStyle: {
			        		  normal: {
			        			  color: '#ea421b',
			        			  shadowBlur: 10,
			        			  shadowColor: '#fff'
			        		  }
			        	  },
			        	  zlevel: 1
			          }
	        ]
	};
	
	//绑定地图点击事件
	this.resourceWarehouseMap.on('click', function(params){
		resourceWarehouseClick(params);
	});
}

//将经纬度信息添加到数据里
function convertData(data) {
	var res = [];
	for (var i = 0; i < data.length; i++) {
		var geoCoord = geoCoordMap[data[i].name];
		if (geoCoord) {
			res.push({
				name: data[i].name,
				value: geoCoord.concat(data[i].value)
			});
		}
	}
	return res;
};

function resourceWarehouseClick(params) {
	if (params.seriesName == '资源仓库') { //点击资源仓库图标
		//随机生成一些数据
		var data = [{value:parseInt(Math.random()*90+10), name:'内存告警'}, {value:parseInt(Math.random()*90+10), name:'CPU告警'},{value:parseInt(Math.random()*90+10), name:'网络中断'},
		            {value:parseInt(Math.random()*90+10), name:'主机宕机'},{value:parseInt(Math.random()*90+10), name:'磁盘告警'},{value:parseInt(Math.random()*90+10), name:'未定义告警'}];
		alertTypePieChartOption.series[0].data = data;
		alertTypePieChartOption.title.subtext = calculateTotalValue(data)+'';
		alertTypePieChart.setOption(alertTypePieChartOption);
		
		alertLevelBarChartOption.xAxis[0].data = ['紧急告警','重要告警','普通告警','提示告警','未定义告警'];
		alertLevelBarChartOption.series[0].data = [parseInt(Math.random()*90+10), parseInt(Math.random()*90+10), parseInt(Math.random()*90+10), parseInt(Math.random()*90+10), parseInt(Math.random()*90+10)];
		alertLevelBarChart.setOption(alertLevelBarChartOption);
	}
}
