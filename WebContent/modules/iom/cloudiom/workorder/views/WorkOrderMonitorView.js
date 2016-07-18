define([
	'text!modules/iom/cloudiom/workorder/templates/WorkOrderMonitorView.html',
	'i18n!modules/iom/cloudiom/workorder/i18n/workorder.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/cloudiom/workorder/styles/workordermonitor.css'
], function(WorkOrderMonitorViewTpl, i18nWorkorder,utils,css) {
	return fish.View.extend({
		template: fish.compile(WorkOrderMonitorViewTpl),
		i18nData: fish.extend({}, i18nWorkorder),
		events: {
			'click #iomWorkOrderMonitor-searchBtn': 'search',                  //查询按钮事件
			'click #iomWorkOrderMonitor-advSearchBtn': 'showAdvSearchFields',  //高级查询按钮事件
			'click #iomWorkOrderMonitor-orderDetailsBtn': 'openOrderDetails',  //定单详情按钮事件
			'click #iomWorkOrderMonitor-checkFlowBtn': 'openWorkFlow',  		 //查看流程按钮事件
			'click #iomWorkOrderMonitor-getWorkOrder': 'getWorkOrder',   	 	 //提单按钮事件
			'click #iomWorkOrderMonitor-finishWorkOrder': 'finishWorkOrder',   //回单按钮事件
			'click #iomWorkOrderMonitor-returnWorkOrder': 'returnWorkOrder',   //退单按钮事件
		},
		
		initialize: function() {
			this.uploadedFilesList = [];
		},
		
		//渲染页面
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//初始化fish组件
		_afterRender: function() {
			//初始化高度
			$('#iomWorkOrderMonitor').css({height: $('#main-tabs-panel').height()-10});
			
			//初始化clearinput
			$('#iomWorkOrderMonitor-orderCode').clearinput();
			$('#iomWorkOrderMonitor-workOrderCode').clearinput();
			
			//初始化图表
			this.initProductBarChart();
			this.initNotFinishPieChart();
			this.initFinishPieChart();
			
			//初始化表格
			this.initiomWorkOrderMonitorGrid();
			this.queryWorkOrders();
	
			//隐藏高级查询条件
			$(".iomWorkOrderMonitor-advSearchFields-row").hide();
			$("#iomWorkOrderMonitor-panel-body").attr("style","padding-bottom: 0px;");
			
			//初始化时间控件
			$("#iomWorkOrderMonitor-startTime").datetimepicker({});
			$("#iomWorkOrderMonitor-endTime").datetimepicker({});
			
			//初始化下拉框
			this.initCombobox();
		},
		
		//初始化表格
		initiomWorkOrderMonitorGrid: function() { 
			var me = this;
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this); //函数作用域改变
			$("#iomWorkOrderMonitor-grid").grid({
				colModel: [
				    //默认展示字段
				    {name: 'alertStatus', label: '告警状态', width: 80},
				    {name: 'workOrderCode', label: '工单编码', width: 150},
				    {name: 'orderTitle', label: '标题', width: 120},
				    {name: 'serviceName', label: '产品服务', width: 160},
				    {name: 'custName', label: '客户名称', width: 150},
				    {name: 'contactNbr', label: '客户号码', width: 100},
				    {name: 'workOrderStateName', label: '工单状态', width: 160}, 
				    {name: 'partyName', label: '当前处理人', width: 100}, 
				    {name: 'limitDate', label: '要求完成时间', width: 150},
				    {name: 'createDate', label: '到单时间', width: 150}, 
				    {name: 'stateDate', label: '最后处理时间', width: 150}, 
				    {name: 'finishDate', label: '完成时间', width: 150}, 
				    
				    //用户可选隐藏字段
				    {name: 'orderCode', label: '定单编码', width: 120, hidden:true},
				    {name: 'alertDate', label: '告警时间', width: 120, hidden:true},
				    {name: 'orderStateName', label: '定单状态', width: 120, hidden:true}, 
				    {name: 'orderId', label: '定单ID', width: 120, hidden:true}, 
				    {name: 'id', label: '工单ID', width: 120, key: true, hidden:true}
				    
				    //用户不可见隐藏字段
				    //processinstanceid
				    //orderState
				    //tacheDefineId
				    //workOrderState
				],
				afterInsertRow: function(e, rowid, data){
					var alertStatus = data.alertStatus;
		            if (alertStatus == "严重超时") {
		            	$("#iomWorkOrderMonitor-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomWorkOrderMonitor-severeOT-icon" style="font-size:16px;margin-left:0px" title="严重超时"></span>',{});
		            }
		            else if (alertStatus == "超时") {
		            	$("#iomWorkOrderMonitor-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomWorkOrderMonitor-overtime-icon" style="font-size:16px;margin-left:0px" title="超时"></span>',{});
		            }
		            else if (alertStatus == "预警") {
		            	$("#iomWorkOrderMonitor-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomWorkOrderMonitor-alert-icon" style="font-size:16px;margin-left:0px" title="预警"></span>',{});
		            }
		            else if (alertStatus == "正常") {
		            	$("#iomWorkOrderMonitor-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomWorkOrderMonitor-normal-icon" style="font-size:16px;margin-left:0px" title="正常"></span>',{});
		            }
				},
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomWorkOrderMonitor-grid").grid("setCheckRows",[rowid]);
					} 
				},
				onDblClickRow: function(e, rowid, iRow, iCol) {
					$("#iomWorkOrderMonitor-grid").grid("setAllCheckRows",false);
					$("#iomWorkOrderMonitor-grid").grid("setCheckRows",[rowid],true);
					me.openOrderDetails();
				},
				datatype: "json",
				autowidth: true,
				rowNum: 10,
				displayNum: 5,
				pager: true,
				gridview: false, //关闭快速加载模式，因为要根据每行记录内容渲染告警状态
				multiselect: true,
				shrinkToFit: false,
				autoResizable: true,
				showColumnsFeature: true, //允许用户自定义列展示设置
				cached: true, //把用户自定义的列展示设置缓存在本地
				pageData: queryWorkOrders
			});
			
			//添加状态标注
			$("#iomWorkOrderMonitor-grid").grid("navButtonAdd",[
				{
					title: "严重超时",
				    caption:" 严重超时",
				    buttonicon:"fa fa-square iomWorkOrderMonitor-severeOT-icon"
				},
			    {
			    	title: "超时",
			        caption:" 超时",
			        buttonicon:"fa fa-square iomWorkOrderMonitor-overtime-icon"
			    },
			    {
			    	title: "预警",
			        caption:" 预警",
			        buttonicon:"fa fa-square iomWorkOrderMonitor-alert-icon"
			    },
			    {
			    	title: "正常",
			        caption:" 正常",
			        buttonicon:"fa fa-square iomWorkOrderMonitor-normal-icon"
			    }
			]);
		},
		
		//初始化产品统计柱状图
		initProductBarChart: function() {
			this.productBarChart = echarts.init(document.getElementById('iomWorkOrderMonitor-productBarChart'), 'macarons');
			this.productBarChartOption = {
					color: ['#0085ff','#ea421b','#dbaa00'],
				    tooltip : {
				        trigger: 'axis'
				    },
				    legend: {
				    	orient : 'horizontal',
				    	x: 'right',
				        data:['未完成','超时未完成','超时完成']
				    },
				    grid : {
				    	left: '0',
	        	        right: '0',
	        	        bottom: '5',
	        	        top:'30',
	        	        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            boundaryGap : true,
				            splitLine: {
				            	show: false
							},
				            data : []
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            splitLine: {
				            	lineStyle: {
				            		type: 'dashed'
				            	}
							},
				        }
				    ],
				    series : [
				        {
				            name:'未完成',
				            type:'bar',
				            barGap: "5%",
				            data: []
				        },
				        {
				            name:'超时未完成',
				            type:'bar',
				            barGap: "5%",
				            data: []
				        },
				        {
				        	name:'超时完成',
				        	type:'bar',
				        	barGap: "5%",
				        	data: []
				        }
				    ]
				};
			
			this.productBarChartOption.xAxis[0].data = ['云主机','物理机','IDC'];
			this.productBarChartOption.series[0].data = [120, 120, 132];//未完成
			this.productBarChartOption.series[1].data = [60, 80, 72];//超时未完成
			this.productBarChartOption.series[2].data = [5, 20, 8];//超时完成
			this.productBarChart.setOption(this.productBarChartOption);
		},
		
		initNotFinishPieChart: function() {
			this.notFinishPieChart = echarts.init(document.getElementById('iomWorkOrderMonitor-notFinishedPieChart'), 'macarons');
			this.notFinishPieChartOption = {
					title: {
						show: true,
						text: '未完成总量',
						subtext: '0',
						left: '31%',
						top: 'center',
						textAlign: 'center',
						textStyle: {
							fontSize: 12
						},
						subtextStyle: {
							fontSize: 14,
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
						left: '59%',
						top: 'center',
				        data:['正常未完成','超时未完成'],
				        itemWidth: 14,
				        itemHeight: 14
				    },
				    series : [
				        {
				            type:'pie',
				            center : ['33%', '50%'],
				            radius : ['50%', '65%'],
				            itemStyle : {
				                normal : {
				                    label : {
				                        show : false
				                    },
				                    labelLine : {
				                        show : false
				                    },
				                    color: function(seriesIndex, series, dataIndex, data) {
				                    	if (seriesIndex.name=='正常未完成') {
				                    		return '#0085ff';
				                    	} else {
				                    		return '#ea421b';
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
			
			var data = [{value:133, name:'正常未完成'}, {value:10, name:'超时未完成'}];
			this.notFinishPieChartOption.series[0].data = data;
			this.notFinishPieChartOption.title.subtext = this.calculateTotalValue(data)+'';
			this.notFinishPieChart.setOption(this.notFinishPieChartOption);
			this.notFinishPieChart.on('click', function(params){
				console.log(params);
			});
		},
		
		initFinishPieChart: function() {
			this.finishPieChart = echarts.init(document.getElementById('iomWorkOrderMonitor-finishedPieChart'), 'macarons');
			this.finishPieChartOption = {
					title: {
						show: true,
						text: '完成总量',
						subtext: '0',
						left: '31%',
						top: 'center',
						textAlign: 'center',
						textStyle: {
							fontSize: 12
						},
						subtextStyle: {
							fontSize: 14,
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
						left: '59%',
						top: 'center',
				        data:['按时完成','超时完成'],
				        itemWidth: 14,
				        itemHeight: 14
				    },
				    series : [
				        {
				            type:'pie',
				            center : ['33%', '50%'],
				            radius : ['50%', '65%'],
				            itemStyle : {
				                normal : {
				                    label : {
				                        show : false
				                    },
				                    labelLine : {
				                        show : false
				                    },
				                    color: function(seriesIndex, series, dataIndex, data) {
				                    	if (seriesIndex.name=='按时完成') {
				                    		return '#0085ff';
				                    	} else {
				                    		return '#dbaa00';
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
			
			var data = [{value:333, name:'按时完成'}, {value:15, name:'超时完成'}];
			this.finishPieChartOption.series[0].data = data;
			this.finishPieChartOption.title.subtext = this.calculateTotalValue(data)+'';
			this.finishPieChart.setOption(this.finishPieChartOption);
			this.finishPieChart.on('click', function(params){
				console.log(params);
			});
		},
		
		calculateTotalValue: function(data) {
			var totalValue = 0;
			for (i in data) {
				totalValue += data[i].value;
			}
			return totalValue;
		},
		
		//初始化下拉框
		initCombobox: function() {
			$('#iomWorkOrderMonitor-orderState').combobox();
			$('#iomWorkOrderMonitor-workOrderState').combobox();
			$('#iomWorkOrderMonitor-tache').combobox();
			$('#iomWorkOrderMonitor-orderType').combobox();
			$('#iomWorkOrderMonitor-printStatus').combobox();
			
			//从后台获取下拉框内容
			utils.ajax('cloudIomServiceForWeb','initTaskManagementPage').done(function(ret){
				//工单状态
				var workOrderStates = ret.workOrderStates;
				$('#iomWorkOrderMonitor-workOrderState').combobox({dataSource: workOrderStates});
				
				//环节
				var taches = ret.taches;
				$('#iomWorkOrderMonitor-tache').combobox({dataSource: taches});
			});
		},
		
		//查询按钮事件
		search: function() { 
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this);
			queryWorkOrders(1, undefined, undefined, undefined);
		},
		
		//查询工单方法
		queryWorkOrders: function(page, rowNum, sortname, sortorder) { 
			rowNum = rowNum || this.$("#iomWorkOrderMonitor-grid").grid("getGridParam", "rowNum");
			page =  page || 1;
			
			//登陆人信息
			var qryConditionMap = {
//				'staffId': currentUser.staffId,
//				'jobId': currentJob.jobId,
//				'qualifiedJobIds': currentJob.jobId,
//				'orgId': currentJob.orgId,
//				'loginOrgId': currentJob.orgId,
				'pageIndex': page+'',
				'pageSize': rowNum+''
			};
			
			//获取表单信息
			var formValue = $('#iomWorkOrderMonitor-Qryform').form("value");
			
			//基本查询条件
			if(formValue["iomWorkOrderMonitor-orderCode"] != undefined && formValue["iomWorkOrderMonitor-orderCode"] != ''){
				qryConditionMap.orderCode = formValue["iomWorkOrderMonitor-orderCode"];
			}
			if(formValue["iomWorkOrderMonitor-workOrderCode"] != undefined && formValue["iomWorkOrderMonitor-workOrderCode"] != ''){
				qryConditionMap.workOrderCode = formValue["iomWorkOrderMonitor-workOrderCode"];
			}
			
			//高级查询条件
			var expand = $("#iomWorkOrderMonitor-advSearchBtn").attr("expand");
			if (expand == "true") { //只有当高级查询展开时，才添加高级查询条件
				if(formValue["iomWorkOrderMonitor-startTime"] != undefined && formValue["iomWorkOrderMonitor-startTime"] != ''){
					qryConditionMap.startTime = formValue["iomWorkOrderMonitor-startTime"];
				}
				if(formValue["iomWorkOrderMonitor-endTime"] != undefined && formValue["iomWorkOrderMonitor-endTime"] != ''){
					qryConditionMap.endTime = formValue["iomWorkOrderMonitor-endTime"];
				}
				if(formValue["iomWorkOrderMonitor-tache"] != undefined && formValue["iomWorkOrderMonitor-tache"] != ''){
					qryConditionMap.tache = formValue["iomWorkOrderMonitor-tache"];
				}
				if(formValue["iomWorkOrderMonitor-orderState"] != undefined && formValue["iomWorkOrderMonitor-orderState"] != ''){
					qryConditionMap.orderState = formValue["iomWorkOrderMonitor-orderState"];
				}
				if(formValue["iomWorkOrderMonitor-workOrderState"] != undefined && formValue["iomWorkOrderMonitor-workOrderState"] != ''){
					qryConditionMap.workOrderState = formValue["iomWorkOrderMonitor-workOrderState"];
				}
				if ($('#iomWorkOrderMonitor-historySearch').is(':checked') == true) {
					qryConditionMap.isHistorySearch = true;
				}
				if ($('#iomWorkOrderMonitor-fuzzySearch').is(':checked') == true) {
					qryConditionMap.isFuzzySearch = true;
				}
			}
			
			//调用后台方法
			$("#iomWorkOrderMonitor-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','queryWorkOrders', qryConditionMap).done(function(ret){
				$("#iomWorkOrderMonitor-grid").grid("reloadData", ret);
				$("#iomWorkOrderMonitor-grid").unblockUI().data('blockui-content', false);
			}).fail(function(ret){
    			fish.error({title:'错误',message:'工单监控查询异常'});
    			$("#iomWorkOrderMonitor-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		//高级查询按钮事件
		showAdvSearchFields: function() { 
			var expand = $("#iomWorkOrderMonitor-advSearchBtn").attr("expand");
			if (expand == "false") { //展开
				$(".iomWorkOrderMonitor-advSearchFields-row").show("fast");
				$("#iomWorkOrderMonitor-advSearchBtn").attr("expand","true");
				$("#iomWorkOrderMonitor-advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#iomWorkOrderMonitor-panel-body").removeAttr("style");
			} else { //收起
				$(".iomWorkOrderMonitor-advSearchFields-row").hide("fast");
				$("#iomWorkOrderMonitor-advSearchBtn").attr("expand","false");
				$("#iomWorkOrderMonitor-advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#iomWorkOrderMonitor-panel-body").attr("style","padding-bottom: 0px;");
			}
			this.resize();
		},
		
		//定单详情按钮事件
		openOrderDetails: function() { 
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this);
			var selections = this.$("#iomWorkOrderMonitor-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var displayFinishWorkOrderBtnInDetail = false;
				if (selected.workOrderState!=null && selected.workOrderState!='' && selected.workOrderState!='10F') {
					displayFinishWorkOrderBtnInDetail = true;
				}
				
				var pop = fish.popupView({
					url: 'modules/iom/cloudiom/task/views/OrderDetailsView',
					width: "80%",
					draggable: false,
					viewOption:{
						baseOrderId: selected.orderId,
						workOrderId: selected.id,
						workOrderCode: selected.workOrderCode,
						displayFinishWorkOrderBtnInDetail: displayFinishWorkOrderBtnInDetail
					},
					callback:function(popup,view){
						popup.result.always(function (e) {
							if (view.isFinishWorkOrder) {
								queryWorkOrders();
							};
						});
					}
				});
			} else if (selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			} else {
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		//提单按钮事件
		getWorkOrder: function() {
			var selections = this.$("#iomWorkOrderMonitor-grid").grid("getCheckRows");//返回所有被选中的行
			if(!selections||selections.length <=0) {
				fish.info({title:'提示',message:'请勾选一条记录！'});
				return false;
			}
			var selected = _.filter(selections, function(o){return o.workOrderState =='10I'||o.workOrderState =='10D';});
			if(!selected||selected.length <=0){
				fish.info({title:'提示',message:'只能对状态为处理中、已派发的工单做提单操作'});
			}
			else{
				var queryWorkOrders =$.proxy(this.queryWorkOrders,this);
				fish.confirm('是否确定要提单？').result.done(function() {
					var workOrderIdArr = [];
					for (i in selected) {
						workOrderIdArr.push(selected[i].id);
					}
					utils.ajax('cloudIomServiceForWeb', 'getWorkOrder', workOrderIdArr,currentUser.staffId,currentUser.staffName,null,null).done(function(ret){
						fish.info({title:'提示',message:'提单成功'});
						queryWorkOrders();
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'提单异常'});
		    		});
		        });
			}
		},
		
		//回单按钮事件 
		finishWorkOrder: function() { 
			var selections = this.$("#iomWorkOrderMonitor-grid").grid("getCheckRows");//返回所有被选中的行
			if(!selections||selections.length <=0) {
				fish.info({title:'提示',message:'请勾选一条记录！'});
				return false;
			}
			var selected = _.filter(selections, function(o){return o.workOrderState =='10I'||o.workOrderState =='10D'||o.workOrderState =='10G';});
			if(!selected||selected.length <=0){
				fish.info({title:'提示',message:'只能对状态为处理中、已派发、已提单的工单做回单操作'});
			}
			else{
				var queryWorkOrders = $.proxy(this.queryWorkOrders,this);
				fish.popupView({url: 'modules/iom/cloudiom/task/views/FinishWorkOrderView',
					width: "60%",
					viewOption:{
						orders : selected,
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							queryWorkOrders();
							//console.log(e);
						},function (e) {
							//console.log('关闭了',e);
						});
					}
				});
			}
		},
		
		//退单按钮事件
		returnWorkOrder: function() { 
			var selections = this.$("#iomWorkOrderMonitor-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1) {
				var selected = selections[0];
				if(!(selected.workOrderState =='10I'||selected.workOrderState =='10D'||selected.workOrderState =='10G')){
					fish.info({title:'提示',message:'只能对状态为处理中、已派发、已提单的工单做退单操作'});
					return false;
				}

				var queryWorkOrders =$.proxy(this.queryWorkOrders,this);
				fish.popupView({url: 'modules/iom/cloudiom/task/views/ReturnWorkOrderView',
					width: "60%",
					viewOption:{
						order : selections[0],
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							queryWorkOrders();
							//console.log(e);
						},function (e) {
							//console.log('关闭了',e);
						});
					}
				});
			} else if(selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			} else {
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		//浏览器窗口大小改变事件
		resize: function() { 
			//整体高度
			$('#iomWorkOrderMonitor').css({height: $('#main-tabs-panel').height()-10});
			
			//按钮、查询条件+表格部分高度
			var expand = $("#iomWorkOrderMonitor-advSearchBtn").attr("expand");
			if (expand == "false") { //收起状态
				$("#iomWorkOrderMonitor-grid").grid("setGridHeight", $('#main-tabs-panel').height() - $('#iomWorkOrderMonitor-charts').height() - 55);
			} else { //展开状态
				$("#iomWorkOrderMonitor-grid").grid("setGridHeight", $('#main-tabs-panel').height() - $('#iomWorkOrderMonitor-charts').height() - 125);
			}
			$("#iomWorkOrderMonitor-grid").grid("resize",true);
			
			//图表
			this.productBarChart.resize();
			this.notFinishPieChart.resize();
			this.finishPieChart.resize();
		},


		openWorkFlow: function() {
			var selections = this.$("#iomWorkOrderMonitor-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1) {
				var selected = selections[0];
				var processInstanceId = selected.processinstanceid;
				fish.popupView({url: 'modules/iom/cloudiom/flowMonitor/views/FlowMonitorView',
					width: "85%",
					viewOption:{
						processInstanceId : processInstanceId
					}
				});
			} else if(selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			} else {
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		}
	});
});