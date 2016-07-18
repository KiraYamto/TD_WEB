define([
	'text!modules/isa/index/templates/IndexView.html',
	'i18n!modules/isa/index/i18n/index.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/index/styles/index.css'
], function(IndexViewTpl, i18nIndex, utils, css) {
	return fish.View.extend({
		template: fish.compile(IndexViewTpl),
		i18nData: fish.extend({}, i18nIndex),
		events: {
			'click .isaIndex-btnIcon': 'shortcutBtnClick',      //常用按钮点击事件
			'click .isaIndex-radio': 'swithRadio',        //radio点击事件
		},
		
		//echarts实例
		planOrderCompleteChart: -1,
		planOrderNotCompleteChart: -1,
		maintenanceOrderChart: -1,
		patrolCheckChart: -1,
		
		//echarts配置
		planOrderCompleteOption: -1,
		planOrderNotCompleteOption: -1,
		maintenanceOrderOption: -1,
		patrolCheckOption: -1,
		
		//查询结果
		queryResult: -1,
		
		//页面最小高度，小于此高度则展示滚动条
		minHeight: 400,
		
		//渲染页面
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//初始化fish组件
		_afterRender: function() {
			//初始化高度宽度
			this.resize();
			
			//初始化表格
			this.initGrid();
			
			//初始化饼图
			this.initPlanOrderCompleteChart(); //作业计划任务单-已完成
			this.initPlanOrderNotCompleteChart(); //作业计划任务单-未完成
			this.initMaintenanceOrderChart(); //运维任务单
			
			//初始化折线图
			this.initPatrolCheckChart(); //巡检统计
			
			//后台取数, 加载数据
			this.loadData();
			
			//设置定时刷新
			this.thread($.proxy(this.loadData,this), 180000);
		},
		
		initGrid: function() {
			$("#isaIndex-grid").grid({
				colModel: [
				    //展示字段
				    {name: 'id', label: 'ID', hidden:true, key: true},
				    {name: 'limitState', label: '告警状态'},
				    {name: 'orderClassName', label: '故障类型'},
				    {name: 'orderTitle', label: '故障标题'},
				    {name: 'orderCode', label: '故障编码'},
				    {name: 'extStateNameOrder', label: '故障单状态'},
				    {name: 'createDate', label: '派发时间'}
				],
				cmTemplate:{sortable: false},
				datatype: "json",
				autowidth: true,
				height: $('#isaIndex-bottomRightContainer').height() - $('.isaIndex-panelHeader').height() -22,
				shrinkToFit: true,
				autoResizable: true,
				gridview: false,
				afterInsertRow: function(e, rowid, data){
					var limitState = data.limitState;
		            if (limitState == "严重超时") {
		            	$("#isaIndex-grid").jqGrid('setCell',rowid,'limitState',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
		            }
		            else if (limitState == "超时") {
		            	$("#isaIndex-grid").jqGrid('setCell',rowid,'limitState',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#dbaa00" title="超时"></span>',{});
		            }
		            else if (limitState == "预警") {
		            	$("#isaIndex-grid").jqGrid('setCell',rowid,'limitState',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
		            }
		            else if (limitState == "正常") {
		            	$("#isaIndex-grid").jqGrid('setCell',rowid,'limitState',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085ff" title="正常"></span>',{});
		            }
				}
			});
		},
		
		initPlanOrderCompleteChart: function() {
			this.planOrderCompleteChart = echarts.init(document.getElementById('isaIndex-planOrderCompleteChart'), 'macarons');
			this.planOrderCompleteOption = {
					title: {
						show: true,
						text: '已完成',
						subtext: '0',
						left: '28%',
						top: 'center',
						textAlign: 'center',
						textStyle: {
							fontSize: 12
						},
						subtextStyle: {
							fontSize: 14,
							fontWeight: 'bold',
							color: '#1888FB'
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
						left: '57%',
						top: 'center',
				        data:['正常完成','超时完成'],
				        itemWidth: 12,
				        itemHeight: 12
				    },
				    series : [
				        {
				            type:'pie',
				            center : ['30%', '50%'],
				            radius : ['52%', '65%'],
				            itemStyle : {
				                normal : {
				                    label : {
				                        show : false
				                    },
				                    labelLine : {
				                        show : false
				                    },
				                    color: function(seriesIndex, series, dataIndex, data) {
				                    	if (seriesIndex.name=='正常完成') {
				                    		return '#1888FB';
				                    	} else {
				                    		return '#8BC6FB';
				                    	}
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
		},
		
		initPlanOrderNotCompleteChart: function() {
			this.planOrderNotCompleteChart = echarts.init(document.getElementById('isaIndex-planOrderNotCompleteChart'), 'macarons');
			this.planOrderNotCompleteOption = {
					title: {
						show: true,
						text: '未完成',
						subtext: '0',
						left: '28%',
						top: 'center',
						textAlign: 'center',
						textStyle: {
							fontSize: 12
						},
						subtextStyle: {
							fontSize: 14,
							fontWeight: 'bold',
							color: '#FD9026'
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
						left: '57%',
						top: 'center',
				        data:['正常单','超时单'],
				        itemWidth: 12,
				        itemHeight: 12
				    },
				    series : [
				        {
				            type:'pie',
				            center : ['30%', '50%'],
				            radius : ['52%', '65%'],
				            itemStyle : {
				                normal : {
				                    label : {
				                        show : false
				                    },
				                    labelLine : {
				                        show : false
				                    },
				                    color: function(seriesIndex, series, dataIndex, data) {
				                    	if (seriesIndex.name=='正常单') {
				                    		return '#FD9026';
				                    	} else {
				                    		return '#FED19C';
				                    	}
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
		},
		
		initMaintenanceOrderChart: function() {
			this.maintenanceOrderChart = echarts.init(document.getElementById('isaIndex-maintenanceOrderChart'), 'macarons');
			this.maintenanceOrderOption = {
					title: {
						show: true,
						text: '未完成',
						subtext: '0',
						left: '28%',
						top: 'center',
						textAlign: 'center',
						textStyle: {
							fontSize: 12
						},
						subtextStyle: {
							fontSize: 14,
							fontWeight: 'bold',
							color: '#41CFCC'
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
						left: '57%',
						top: 'center',
				        data:['正常单','超时单'],
				        itemWidth: 12,
				        itemHeight: 12
				    },
				    series : [
				        {
				            type:'pie',
				            center : ['30%', '50%'],
				            radius : ['52%', '65%'],
				            itemStyle : {
				                normal : {
				                    label : {
				                        show : false
				                    },
				                    labelLine : {
				                        show : false
				                    },
				                    color: function(seriesIndex, series, dataIndex, data) {
				                    	if (seriesIndex.name=='正常单') {
				                    		return '#41CFCC';
				                    	} else {
				                    		return '#79EEEB';
				                    	}
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
		},
		
		initPatrolCheckChart: function() {
			this.patrolCheckChart = echarts.init(document.getElementById('isaIndex-patrolCheckChart'), 'macarons');
			this.patrolCheckOption = {
					color: ['#df0000','#e4bd07'],
					title: {
						show: true,
						text: '巡检统计',
						x: 'left',
						y: 'top',
						padding: [0,5,5,10],
						textAlign: 'left',
						textStyle: {
							fontSize: 17,
							fontWeight: 'normal'
						}
					},
				    tooltip : {
				        trigger: 'axis',
				        formatter: function(params, ticket, callback) {
				            var str = params[0].name + '<br/>当日单量 : ';
				            var total = 0;
				            var str2 = '';
				            for (var i = 0, l = params.length; i < l; i++) {
				            	total = total + params[i].value;
				            	var color = params[i].color;
				            	str2 += '<br/><span style="color:'+color+';font-size:18px;margin:3px">●</span>' + params[i].seriesName + ' : ' + params[i].value;
				            }
				            str = str + total + str2;
				            return str;
				        }
				    },
				    legend: {
				    	orient : 'horizontal',
				    	x: '25%',
				        itemGap: 20,
				        data:['完成单量','未完成单量']
				    },
				    toolbox: {
				        show : true,
				        padding: [5,18,5,5],
				        feature : {
				            dataView : {show: true, readOnly: false},
				            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
				            restore : {show: true},
				            saveAsImage : {show: true}
				        }
				    },
				    xAxis : [
				        {
				            type : 'category',
				            boundaryGap : false,
				            data : []
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value'
				        }
				    ],
				    series : [
				        {
				            name:'完成单量',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data: []
				        },
				        {
				            name:'未完成单量',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data:[150, 182, 100, 154, 190, 320, 310, 210, 110, 10]
				        }
				    ]
				};
		},
		
		loadData: function() {
			var me = this;
			var calculateTotalValue = $.proxy(this.calculateTotalValue,this);
			var swithRadio = $.proxy(this.swithRadio,this);
			
			//查询条件
			var params = {
					orgId: currentJob.orgId,
					jobId: currentJob.jobId,
					staffId: currentUser.staffId,
					dutId: null
			};
			params.limit = 15;
			utils.ajax('isaMainLoginService','qryCurrSusRouteListdefine', params).done(function(ret){
				//即时代办列表
				$("#isaIndex-grid").grid("reloadData", ret);
			});
			
			if (me.queryResult == -1) { //第一次加载，显示遮盖
				$("#isaIndex-leftContainer").blockUI({message: '加载中'}).data('blockui-content', true);
			}
			utils.ajax('isaMainLoginService','qryRouteList', {}).done(function(ret){
				me.queryResult = ret;
				
				//在途单统计
				swithRadio();
				
				//环形图
				var listOrderFinish = ret.listOrderFinish;
				me.planOrderCompleteOption.series[0].data = listOrderFinish;
				me.planOrderCompleteOption.title.subtext = calculateTotalValue(listOrderFinish)+'';
				me.planOrderCompleteChart.setOption(me.planOrderCompleteOption);
				
				var listOrderNotFinish = ret.listOrderNotFinish;
				me.planOrderNotCompleteOption.series[0].data = listOrderNotFinish;
				me.planOrderNotCompleteOption.title.subtext = calculateTotalValue(listOrderNotFinish)+'';
				me.planOrderNotCompleteChart.setOption(me.planOrderNotCompleteOption);
				
				var listMainWorkOrder = ret.listMainWorkOrder;
				me.maintenanceOrderOption.series[0].data = listMainWorkOrder;
				me.maintenanceOrderOption.title.subtext = calculateTotalValue(listMainWorkOrder)+'';
				me.maintenanceOrderChart.setOption(me.maintenanceOrderOption);
				
				//折线图
				me.patrolCheckOption.xAxis[0].data = ret.date;
				me.patrolCheckOption.series[0].data = ret.completed;//完成单量
				me.patrolCheckOption.series[1].data = ret.notCompleted;//未完成单量
				me.patrolCheckChart.setOption(me.patrolCheckOption);
				
				if ($('#isaIndex-leftContainer').data('blockui-content')) { //解除遮盖，假如有
					$("#isaIndex-leftContainer").unblockUI().data('blockui-content', false);
				}
			}).fail(function(ret) {
				if ($('#isaIndex-leftContainer').data('blockui-content')) { //解除遮盖，假如有
					$("#isaIndex-leftContainer").unblockUI().data('blockui-content', false);
				}
			});
		},
		
		//浏览器窗口大小改变事件
		resize: function() { 
			//高度
			$('#isaIndex').css({height: $('#main-tabs-panel').height()>this.minHeight?$('#main-tabs-panel').height()-10:this.minHeight});
			
			//宽度
			if ($('#isaIndex').width()*0.5 > 560) {
				$('#isaIndex-leftContainer').css({width: "50%"});
			} else { //不允许左半屏小于560
				$('#isaIndex-leftContainer').css({width: "560px"});
			}
			var widthPercent = 100-(($('#isaIndex-leftContainer').width()+10)/$('#isaIndex').width()*100) + '%';
			$('#isaIndex-topRightContainer').css({width: widthPercent});
			$('#isaIndex-bottomRightContainer').css({width: widthPercent});
			
			//常用按钮图标大小自适应
			if ($('#isaIndex-topRightContainer').width() > 1150) {
				$('.isaIndex-btnIcon').css({'height': '120px', 'width': '120px', 'line-height': '120px', 'font-size': '60px'});
			} else if ($('#isaIndex-topRightContainer').width() > 750) {
				$('.isaIndex-btnIcon').css({'height': '90px', 'width': '90px', 'line-height': '90px', 'font-size': '45px'});
			} else if ($('#isaIndex-topRightContainer').width() < 350) {
				$('.isaIndex-btnIcon').css({'height': '30px', 'width': '30px', 'line-height': '30px', 'font-size': '15px'});
			} else {
				$('.isaIndex-btnIcon').css({'height': '60px', 'width': '60px', 'line-height': '60px', 'font-size': '30px'});
			}
			
			//表格
			$("#isaIndex-grid").grid("setGridHeight", $('#isaIndex-bottomRightContainer').height() - $('.isaIndex-panelHeader').height() -22);
			$("#isaIndex-grid").grid("resize",true);
			
			//图表
			if (this.planOrderCompleteChart != -1) {
				this.planOrderCompleteChart.resize();
			}
			if (this.planOrderNotCompleteChart != -1) {
				this.planOrderNotCompleteChart.resize();
			}
			if (this.maintenanceOrderChart != -1) {
				this.maintenanceOrderChart.resize();
			}
			if (this.patrolCheckChart != -1) {
				this.patrolCheckChart.resize();
			}
			
			//垂直居中
			$('#isaIndex-btnGroup').css({'margin-top': (($('#isaIndex-topRightPanel').height()-40)/2)-($('#isaIndex-btnGroup').height()/2) });
			$('.isaIndex-statSquare h5').css({'margin-top': (($('.isaIndex-statSquare').height()-40)/2)-($('.isaIndex-statSquare h5').height()/2) });
		},
		
		shortcutBtnClick: function(e) {
			var targetPage = e.target.getAttribute('target');
			window.location.hash = '#';
			window.location.hash = targetPage;
		},
		
		calculateTotalValue: function(data) {
			var totalValue = 0;
			for (i in data) {
				totalValue += data[i].value;
			}
			return totalValue;
		},
		
		swithRadio: function() {
			var me = this;
			var data = [];
			if (me.$('input:radio[name=isaIndex-radio]:checked').val() == 'operRadio') {
				data = me.queryResult.listOper;
			} else {
				data = me.queryResult.listCust;
			}
			
			//在途单统计
			var value = _.filter(data, function(o){return o.name =='正常';});
			if (value.length > 0) {
				me.$('#isaIndex-statSquareNormalValue').html(value[0].value);
			}
			
			value = _.filter(data, function(o){return o.name =='预警';});
			if (value.length > 0) {
				me.$('#isaIndex-statSquareAlertValue').html(value[0].value);
			}
			
			value = _.filter(data, function(o){return o.name =='超时';});
			if (value.length > 0) {
				me.$('#isaIndex-statSquareOvertimeValue').html(value[0].value);
			}
			
			value = _.filter(data, function(o){return o.name =='严重超时';})
			if (value.length > 0) {
				me.$('#isaIndex-statSquareSevereOTValue').html(value[0].value);
			}
		}
	});
});