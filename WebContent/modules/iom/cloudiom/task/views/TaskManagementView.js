define([
	'text!modules/iom/cloudiom/task/templates/TaskManagementView.html'+codeVerP,
	'i18n!modules/iom/cloudiom/task/i18n/task.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/cloudiom/task/styles/taskmanagement.css'+codeVerP
], function(TaskManagementViewTpl, i18nTask,utils,css) {
	return fish.View.extend({
		template: fish.compile(TaskManagementViewTpl),
		i18nData: fish.extend({}, i18nTask),
		events: {
			'click #iomTaskManagement-tabs-pendingReceive-link': 'pendingReceiveClick', //待接单区点击事件
			'click #iomTaskManagement-tabs-pendingDeal-link': 'pendingDealClick', 		//待处理区点击事件
			'click #iomTaskManagement-tabs-dealed-link': 'dealedClick', 				//已处理区点击事件
			'click #iomTaskManagement-searchBtn': 'search',                  			//查询按钮事件
			'click #iomTaskManagement-advSearchBtn': 'showAdvSearchFields',  			//高级查询按钮事件
			'click #iomTaskManagement-orderDetailsBtn': 'openOrderDetails',  			//定单详情按钮事件
			'click #iomTaskManagement-checkFlowBtn': 'openWorkFlow',  		 			//查看流程按钮事件
			'click #iomTaskManagement-getWorkOrder': 'getWorkOrder',   	 	 			//提单按钮事件
			'click #iomTaskManagement-finishWorkOrder': 'finishWorkOrder',   			//回单按钮事件
			'click #iomTaskManagement-returnWorkOrder': 'returnWorkOrder',   			//退单按钮事件
			'click #iomTaskManagement-fileUpload': 'fileUpload'       		 			//上传事件
		},
		
		initialize: function() {
			this.uploadedFilesList = [];
			this.workOrderState = "";
			this.displayFinishWorkOrderBtnInDetail = false;
		},
		
		//渲染页面
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//初始化fish组件
		_afterRender: function() {
			//初始化tab
			$('#iomTaskManagement-tab').tabs();
			
			//初始化表格
			this.initIomTaskManagementGrid();
			
			//默认选中待接单区
			$('#iomTaskManagement-tabs-pendingReceive-link').click();
			
			//初始化clearinput
			$('#iomTaskManagement-orderCode').clearinput();
			$('#iomTaskManagement-workOrderCode').clearinput();
	
			//隐藏高级查询条件
			$(".iomTaskManagement-advSearchFields-row").hide();
			$("#iomTaskManagement-panel-body").attr("style","padding-bottom: 0px;");
			
			//初始化时间控件
			$("#iomTaskManagement-startTime").datetimepicker({});
			$("#iomTaskManagement-endTime").datetimepicker({});
			
			//初始化下拉框
			this.initCombobox();
		},
		
		//初始化表格
		initIomTaskManagementGrid: function() { 
			var me = this;
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this); //函数作用域改变
			$("#iomTaskManagement-grid").grid({
				colModel: [
				    //默认展示字段
				    {name: 'alertStatus', label: '告警状态', width: 80},
				    {name: 'orderCode', label: '定单编码', width: 120}, 		//特殊字段，待接单待处理隐藏，以处理显示
				    {name: 'workOrderCode', label: '工单编码', width: 150},	//特殊字段，待接单待处理显示，以处理隐藏
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
		            	$("#iomTaskManagement-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomTaskManagement-severeOT-icon" style="font-size:16px;margin-left:0px" title="严重超时"></span>',{});
		            }
		            else if (alertStatus == "超时") {
		            	$("#iomTaskManagement-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomTaskManagement-overtime-icon" style="font-size:16px;margin-left:0px" title="超时"></span>',{});
		            }
		            else if (alertStatus == "预警") {
		            	$("#iomTaskManagement-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomTaskManagement-alert-icon" style="font-size:16px;margin-left:0px" title="预警"></span>',{});
		            }
		            else if (alertStatus == "正常") {
		            	$("#iomTaskManagement-grid").jqGrid('setCell',rowid,'alertStatus',
		            		'<span class="fa fa-square iomTaskManagement-normal-icon" style="font-size:16px;margin-left:0px" title="正常"></span>',{});
		            }
				},
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomTaskManagement-grid").grid("setCheckRows",[rowid]);
					} 
				},
				onDblClickRow: function(e, rowid, iRow, iCol) {
					$("#iomTaskManagement-grid").grid("setAllCheckRows",false);
					$("#iomTaskManagement-grid").grid("setCheckRows",[rowid],true);
					me.openOrderDetails();
				},
				columnsFeatureChanged: function(e, cm) {
					fish.store.set('iomTaskManagement-isColumnsFeatureChanged','true');
				},
				datatype: "json",
				cmTemplate:{sortable: false},
				autowidth: true,
				rowNum: 10,
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
			$("#iomTaskManagement-grid").grid("navButtonAdd",[
				{
					title: "严重超时",
				    caption:" 严重超时",
				    buttonicon:"fa fa-square iomTaskManagement-severeOT-icon"
				},
			    {
			    	title: "超时",
			        caption:" 超时",
			        buttonicon:"fa fa-square iomTaskManagement-overtime-icon"
			    },
			    {
			    	title: "预警",
			        caption:" 预警",
			        buttonicon:"fa fa-square iomTaskManagement-alert-icon"
			    },
			    {
			    	title: "正常",
			        caption:" 正常",
			        buttonicon:"fa fa-square iomTaskManagement-normal-icon"
			    }
			]);
		},
		
		//初始化下拉框
		initCombobox: function() {
			$('#iomTaskManagement-tache').combobox();
			
			//从后台获取下拉框内容
			utils.ajax('cloudIomServiceForWeb','initTaskManagementPage').done(function(ret){
				//环节
				var taches = ret.taches;
				$('#iomTaskManagement-tache').combobox({dataSource: taches});
			});
		},
		
		//查询按钮事件
		search: function() { 
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this);
			queryWorkOrders(1, undefined, undefined, undefined);
		},
		
		//查询工单方法
		queryWorkOrders: function(page, rowNum, sortname, sortorder) { 
			rowNum = rowNum || this.$("#iomTaskManagement-grid").grid("getGridParam", "rowNum");
			
			//登陆人信息
			var qryConditionDto = {
				'staffId':currentUser.staffId,
				'jobId':currentJob.jobId,
				'qualifiedJobIds':currentJob.jobId,
				'orgId':currentJob.orgId,
				'loginOrgId':currentJob.orgId
			};
			
			//获取表单信息
			var formValue = $('#iomTaskManagement-Qryform').form("value");
			
			//任务管理必要查询条件
			qryConditionDto.workOrderState = this.workOrderState;
			
			//基本查询条件
			if(formValue["iomTaskManagement-orderCode"] != undefined && formValue["iomTaskManagement-orderCode"] != ''){
				qryConditionDto.orderCode = formValue["iomTaskManagement-orderCode"];
			}
			if(formValue["iomTaskManagement-workOrderCode"] != undefined && formValue["iomTaskManagement-workOrderCode"] != ''){
				qryConditionDto.workOrderCode = formValue["iomTaskManagement-workOrderCode"];
			}
			
			//高级查询条件
			var expand = $("#iomTaskManagement-advSearchBtn").attr("expand");
			if (expand == "true") { //只有当高级查询展开时，才添加高级查询条件
				if(formValue["iomTaskManagement-startTime"] != undefined && formValue["iomTaskManagement-startTime"] != ''){
					qryConditionDto.startTime = formValue["iomTaskManagement-startTime"];
				}
				if(formValue["iomTaskManagement-endTime"] != undefined && formValue["iomTaskManagement-endTime"] != ''){
					qryConditionDto.endTime = formValue["iomTaskManagement-endTime"];
				}
				if(formValue["iomTaskManagement-tache"] != undefined && formValue["iomTaskManagement-tache"] != ''){
					qryConditionDto.tache = formValue["iomTaskManagement-tache"];
				}
				if ($('#iomTaskManagement-historySearch').is(':checked') == true) {
					qryConditionDto.historySearch = true;
				}
				if ($('#iomTaskManagement-fuzzySearch').is(':checked') == true) {
					qryConditionDto.fuzzySearch = true;
				}
			}
			
			//调用后台方法
			$("#iomTaskManagement-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','queryTaskManagement', qryConditionDto, page || 1, rowNum).done(function(ret){
				workOrders = JSON.parse(ret);
				$("#iomTaskManagement-grid").grid("reloadData", workOrders);
				$("#iomTaskManagement-grid").unblockUI().data('blockui-content', false);
			}).fail(function(ret){
    			fish.error({title:'错误',message:'任务管理查询异常'});
    			$("#iomTaskManagement-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		//高级查询按钮事件
		showAdvSearchFields: function() { 
			var expand = $("#iomTaskManagement-advSearchBtn").attr("expand");
			if (expand == "false") { //展开
				$(".iomTaskManagement-advSearchFields-row").show("fast");
				$("#iomTaskManagement-advSearchBtn").attr("expand","true");
				$("#iomTaskManagement-advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#iomTaskManagement-panel-body").removeAttr("style");
			} else { //收起
				$(".iomTaskManagement-advSearchFields-row").hide("fast");
				$("#iomTaskManagement-advSearchBtn").attr("expand","false");
				$("#iomTaskManagement-advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#iomTaskManagement-panel-body").attr("style","padding-bottom: 0px;");
			}
			this.resize();
		},
		
		//定单详情按钮事件
		openOrderDetails: function() { 
			var queryWorkOrders = $.proxy(this.queryWorkOrders,this);
			var selections = this.$("#iomTaskManagement-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var pop = fish.popupView({
					url: 'modules/iom/cloudiom/task/views/OrderDetailsView',
					width: "80%",
					draggable: false,
					viewOption:{
						baseOrderId: selected.orderId,
						workOrderId: selected.id,
						workOrderCode: selected.workOrderCode,
						displayFinishWorkOrderBtnInDetail: this.displayFinishWorkOrderBtnInDetail
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
			var selections = this.$("#iomTaskManagement-grid").grid("getCheckRows");//返回所有被选中的行
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
			var selections = this.$("#iomTaskManagement-grid").grid("getCheckRows");//返回所有被选中的行
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
			var selections = this.$("#iomTaskManagement-grid").grid("getCheckRows");//返回所有被选中的行
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
			var expand = $("#iomTaskManagement-advSearchBtn").attr("expand");
			if (expand == "false") { //收起状态
				$("#iomTaskManagement-grid").grid("setGridHeight", $('#main-tabs-panel').height() - 117);
			} else { //展开状态
				$("#iomTaskManagement-grid").grid("setGridHeight", $('#main-tabs-panel').height() - 159);
			}
			$("#iomTaskManagement-grid").grid("resize",true);
		},
		
		//附件上传
		fileUpload: function() {
			fish.popupView({url: 'modules/common/fileUpload/views/fileUploadView',
				width: "50%",
				viewOption:{
					moduleName : 'IOM',
					fileType : 'XML',
					businessCode : '123',
					uploadedFilesList: this.uploadedFilesList
				},
				callback:function(popup,view){
					popup.result.always(function (e) {
						console.log(this.uploadedFilesList);
					});
				}
			});
		},
		
		//查看流程
		openWorkFlow: function() {
			var selections = this.$("#iomTaskManagement-grid").grid("getCheckRows");//返回所有被选中的行
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
		},
		
		//待接单区点击
		pendingReceiveClick: function() {
			this.workOrderState = "'10I','10D'"; //强制查询工单状态
			this.displayFinishWorkOrderBtnInDetail = false;
			$('#iomTaskManagement-getWorkOrder').show();
			$('#iomTaskManagement-finishWorkOrder').hide();
			$('#iomTaskManagement-returnWorkOrder').hide();
			$('#iomTaskManagement-fileUpload').hide();
			if (fish.store.get('iomTaskManagement-isColumnsFeatureChanged') != 'true') {
				$("#iomTaskManagement-grid").grid("showCol","workOrderCode");
				$("#iomTaskManagement-grid").grid("hideCol","orderCode");
			}
			this.queryWorkOrders();
		},
		
		//待处理区点击
		pendingDealClick: function() {
			this.workOrderState = "10G"; //强制查询工单状态
			this.displayFinishWorkOrderBtnInDetail = true;
			$('#iomTaskManagement-getWorkOrder').hide();
			$('#iomTaskManagement-finishWorkOrder').show();
			$('#iomTaskManagement-returnWorkOrder').show();
			$('#iomTaskManagement-fileUpload').show();
			if (fish.store.get('iomTaskManagement-isColumnsFeatureChanged') != 'true') {
				$("#iomTaskManagement-grid").grid("showCol","workOrderCode");
				$("#iomTaskManagement-grid").grid("hideCol","orderCode");
			}
			this.queryWorkOrders();
		},
		
		//已处理区点击
		dealedClick: function() {
			this.workOrderState = "10F"; //强制查询工单状态
			this.displayFinishWorkOrderBtnInDetail = false;
			$('#iomTaskManagement-getWorkOrder').hide();
			$('#iomTaskManagement-finishWorkOrder').hide();
			$('#iomTaskManagement-returnWorkOrder').hide();
			$('#iomTaskManagement-fileUpload').hide();
			if (fish.store.get('iomTaskManagement-isColumnsFeatureChanged') != 'true') {
				$("#iomTaskManagement-grid").grid("hideCol","workOrderCode");
				$("#iomTaskManagement-grid").grid("showCol","orderCode");
			}
			this.queryWorkOrders();
		}
		
	}); //fish.View.extend END
}); //ALL END