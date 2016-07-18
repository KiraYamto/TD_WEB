define([
	'text!modules/iom/cloudiom/index/templates/IndexView.html',
	'i18n!modules/iom/cloudiom/index/i18n/index.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/cloudiom/index/styles/index.css'
], function(IndexViewTpl, i18nIndex, utils, css) {
	return fish.View.extend({
		template: fish.compile(IndexViewTpl),
		i18nData: fish.extend({}, i18nIndex),
		events: {
			'click .iomIndex-btnIcon': 'shortcutBtnClick'        //常用按钮点击事件
		},
		
		//echarts实例
		cloudHostChart: -1,
		physicalMachineChart: -1,
		idcChart: -1,
		newOrdersChart: -1,
		
		//echarts配置
		cloudHostOption: -1,
		physicalMachineOption: -1,
		idcOption: -1,
		newOrdersOption: -1,
		
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
			this.initCloudHostChart(); //云主机
			this.initPhysicalMachineChart(); //物理机
			this.initIdcChart(); //IDC
			
			//初始化折线图
			this.initNewOrdersChart(); //新增业务
			
			//后台取数, 加载数据
			this.loadData();
		},
		
		initGrid: function() {
			$("#iomIndex-grid").grid({
				colModel: [
				    //展示字段
				    {name: 'id', label: 'ID', hidden:true, key: true},
				    {name: 'alertStatus', label: '告警状态'},
				    {name: 'workOrderCode', label: '工单编码'},
				    {name: 'workOrderStateName', label: '工单状态'},
				    {name: 'partyName', label: '当前处理人'},
				    {name: 'createDate', label: '到单时间'},
				    {name: 'limitDate', label: '要求完成时间'}
				],
				cmTemplate:{sortable: false},
				datatype: "json",
				autowidth: true,
				height: $('#iomIndex-bottomRightContainer').height() - $('.iomIndex-panelHeader').height() -22,
				shrinkToFit: true,
				autoResizable: true,
				gridview: false,
				afterInsertRow: function(e, rowid, data){
					var alertStatus = data.alertStatus;
		            if (alertStatus == "严重超时") {
		            	$("#iomIndex-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
		            }
		            else if (alertStatus == "超时") {
		            	$("#iomIndex-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#dbaa00" title="超时"></span>',{});
		            }
		            else if (alertStatus == "预警") {
		            	$("#iomIndex-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
		            }
		            else if (alertStatus == "正常") {
		            	$("#iomIndex-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085ff" title="正常"></span>',{});
		            }
				}
			});
		},
		
		initPieChart: function(myChart, myOption, domId, name, legend, color) {
			
		},
		
		initCloudHostChart: function() {
			this.cloudHostChart = echarts.init(document.getElementById('iomIndex-cloudHostChart'), 'macarons');
			this.cloudHostOption = {
					title: {
						show: true,
						text: '云主机',
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
		
		initPhysicalMachineChart: function() {
			this.physicalMachineChart = echarts.init(document.getElementById('iomIndex-physicalMachineChart'), 'macarons');
			this.physicalMachineOption = {
					title: {
						show: true,
						text: '物理机',
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
		
		initIdcChart: function() {
			this.idcChart = echarts.init(document.getElementById('iomIndex-idcChart'), 'macarons');
			this.idcOption = {
					title: {
						show: true,
						text: 'IDC',
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
		
		initNewOrdersChart: function() {
			this.newOrdersChart = echarts.init(document.getElementById('iomIndex-newOrdersChart'), 'macarons');
			this.newOrdersOption = {
					color: ['#1888FB','#FD9026','#41CFCC'],
					title: {
						show: true,
						text: '新增业务',
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
				        trigger: 'axis'
				    },
				    legend: {
				    	orient : 'horizontal',
				    	x: '21%',
				        itemGap: 15,
				        data:['云主机','物理机','IDC']
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
				            name:'云主机',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data: []
				        },
				        {
				            name:'物理机',
				            type:'line',
				            symbol: 'circle',
				            symbolSize: 7,
				            data: []
				        },
				        {
				        	name:'IDC',
				        	type:'line',
				        	symbol: 'circle',
				        	symbolSize: 7,
				        	data: []
				        }
				    ]
				};
		},
		
		loadData: function() {
			var me = this;
			var calculateTotalValue = $.proxy(this.calculateTotalValue,this);
			var rownum = $("#iomIndex-grid").grid("getGridParam", "rowNum");
			
			//查询条件
			var qryConditionDto = {
					'staffId':currentUser.staffId,
					'jobId':currentJob.jobId,
					'qualifiedJobIds':currentJob.jobId,
					'orgId':currentJob.orgId,
					'loginOrgId':currentJob.orgId,
					workOrderState: "'10I','10D','10G'"
				};
			
			//查询即时代办列表
			utils.ajax('cloudIomServiceForWeb','queryTaskManagement', qryConditionDto, 1, rownum).done(function(ret){
				workOrders = JSON.parse(ret);
				$("#iomIndex-grid").grid("reloadData", workOrders);
			});
			
			if (me.queryResult == -1) { //第一次加载，显示遮盖
				$("#iomIndex-leftContainer").blockUI({message: '加载中'}).data('blockui-content', true);
			}
			utils.ajax('cloudIomServiceForWeb','getIndexStatistics', {}).done(function(ret){
				me.queryResult = ret;
				
				//在途单统计
				me.$('#iomIndex-statSquareNormalValue').html(ret.normalOrderCount);
				me.$('#iomIndex-statSquareAlertValue').html(ret.alertOrderCount);
				me.$('#iomIndex-statSquareOvertimeValue').html(ret.overtimeOrderCount);
				me.$('#iomIndex-statSquareSevereOTValue').html('0');
				
				if ($('#iomIndex-leftContainer').data('blockui-content')) { //解除遮盖，假如有
					$("#iomIndex-leftContainer").unblockUI().data('blockui-content', false);
				}
			}).fail(function(ret) {
				if ($('#iomIndex-leftContainer').data('blockui-content')) { //解除遮盖，假如有
					$("#iomIndex-leftContainer").unblockUI().data('blockui-content', false);
				}
			});
			
			//业务开通单环形图 
//			var data = [{value:133, name:'正常单'}, {value:10, name:'超时单'}];
			var data = [{value:0, name:'正常单'}, {value:0, name:'超时单'}];
			me.cloudHostOption.series[0].data = data;
			me.cloudHostOption.title.subtext = calculateTotalValue(data)+'';
			me.cloudHostChart.setOption(me.cloudHostOption);
			
//			data = [{value:88, name:'正常单'}, {value:17, name:'超时单'}];
			data = [{value:0, name:'正常单'}, {value:0, name:'超时单'}];
			me.physicalMachineOption.series[0].data = data;
			me.physicalMachineOption.title.subtext = calculateTotalValue(data)+'';
			me.physicalMachineChart.setOption(me.physicalMachineOption);
			
//			data = [{value:108, name:'正常单'}, {value:20, name:'超时单'}];
			data = [{value:0, name:'正常单'}, {value:0, name:'超时单'}];
			me.idcOption.series[0].data = data;
			me.idcOption.title.subtext = calculateTotalValue(data)+'';
			me.idcChart.setOption(me.idcOption);
			
			//新增业务折线图
			me.newOrdersOption.xAxis[0].data = [fish.dateutil.format(fish.dateutil.addDays(new Date(),-9),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-8),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-7),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-6),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-5),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-4),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-3),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-2),"m/dd"),fish.dateutil.format(fish.dateutil.addDays(new Date(),-1),"m/dd"),fish.dateutil.format(new Date(),"m/dd")];;
//			me.newOrdersOption.series[0].data = [120, 132, 120, 134, 190, 130, 110, 133, 110, 110];//云主机
			me.newOrdersOption.series[0].data = [0,0,0,0,0,0,0,0,0,0];//云主机
//			me.newOrdersOption.series[1].data = [60, 72, 80, 94, 100, 40, 70, 30, 63, 50];//物理机
			me.newOrdersOption.series[1].data = [0,0,0,0,0,0,0,0,0,0];//物理机
//			me.newOrdersOption.series[2].data = [5, 8, 20, 54, 65, 20, 10, 10, 33, 10];//IDC
			me.newOrdersOption.series[2].data = [0,0,0,0,0,0,0,0,0,0];//IDC
			me.newOrdersChart.setOption(me.newOrdersOption);
		},
		
		//浏览器窗口大小改变事件
		resize: function() { 
			//高度
			$('#iomIndex').css({height: $('#main-tabs-panel').height()>this.minHeight?$('#main-tabs-panel').height()-10:this.minHeight});
			
			//宽度
			if ($('#iomIndex').width()*0.5 > 560) {
				$('#iomIndex-leftContainer').css({width: "50%"});
			} else { //不允许左半屏小于560
				$('#iomIndex-leftContainer').css({width: "560px"});
			}
			var widthPercent = 100-(($('#iomIndex-leftContainer').width()+10)/$('#iomIndex').width()*100) + '%';
			$('#iomIndex-topRightContainer').css({width: widthPercent});
			$('#iomIndex-bottomRightContainer').css({width: widthPercent});
			
			//常用按钮图标大小自适应
			if ($('#iomIndex-topRightContainer').width() > 1150) {
				$('.iomIndex-btnIcon').css({'height': '120px', 'width': '120px', 'line-height': '120px', 'font-size': '60px'});
			} else if ($('#iomIndex-topRightContainer').width() > 750) {
				$('.iomIndex-btnIcon').css({'height': '90px', 'width': '90px', 'line-height': '90px', 'font-size': '45px'});
			} else if ($('#iomIndex-topRightContainer').width() < 350) {
				$('.iomIndex-btnIcon').css({'height': '30px', 'width': '30px', 'line-height': '30px', 'font-size': '15px'});
			} else {
				$('.iomIndex-btnIcon').css({'height': '60px', 'width': '60px', 'line-height': '60px', 'font-size': '30px'});
			}
			
			//表格
			$("#iomIndex-grid").grid("setGridHeight", $('#iomIndex-bottomRightContainer').height() - $('.iomIndex-panelHeader').height() -22);
			$("#iomIndex-grid").grid("resize",true);

			//图表
			if (this.cloudHostChart != -1) {
				this.cloudHostChart.resize();
			}
			if (this.physicalMachineChart != -1) {
				this.physicalMachineChart.resize();
			}
			if (this.idcChart != -1) {
				this.idcChart.resize();
			}
			if (this.newOrdersChart != -1) {
				this.newOrdersChart.resize();
			}
			
			//垂直居中
			$('#iomIndex-btnGroup').css({'margin-top': (($('#iomIndex-topRightPanel').height()-40)/2)-($('#iomIndex-btnGroup').height()/2) });
			$('.iomIndex-statSquare h5').css({'margin-top': (($('.iomIndex-statSquare').height()-40)/2)-($('.iomIndex-statSquare h5').height()/2) });
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
		}
	});
});