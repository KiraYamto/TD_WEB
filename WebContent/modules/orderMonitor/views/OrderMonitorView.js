define([
	'text!modules/orderMonitor/templates/OrderMonitorView.html'+codeVerP,
	'i18n!modules/orderMonitor/i18n/orderMonitor.i18n',
	'modules/common/cloud-utils',
	'css!modules/orderMonitor/styles/orderMonitor.css'+codeVerP
], function(OrderMonitorViewTpl, i18nOrderMonitor,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(OrderMonitorViewTpl),
		i18nData: fish.extend({}, i18nOrderMonitor),
		events: {
			'click #orderMonitor-search-btn':'orderSearch',
			'click #orderMonitor-workOrder-feedback-btn':'feedbackOper',
			'click #orderMonitor-order-grid': 'selectTaskClick'
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			html.find('#login-job-list>a').on('click',$.proxy(this.selectTaskClick, this));


			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
			
			/*$("#agents-tabs").tabs();*/
			
			this.loadOrderGridRender();
			this.getOrderGridPerData();
			this.loadWorkOrderGridRender();
		},
		agencyTabsAClick:function(){
			this.$('#agency-tabs-a').show();
			this.$('#agency-tabs-b').hide();
			this.$('#agency-tabs-a-li').addClass('ui-tabs-active');
			this.$('#agency-tabs-b-li').removeClass('ui-tabs-active');
			/*this.$('#agency-tabs').tabs('option', 'active',0);*/
			$(window).resize();
		},
		agencyTabsBClick:function(){
			this.$('#agency-tabs-b').show();
			this.$('#agency-tabs-a').hide();
			this.$('#agency-tabs-a-li').removeClass('ui-tabs-active');
			this.$('#agency-tabs-b-li').addClass('ui-tabs-active');
			/*this.$('#agency-tabs').tabs('option', 'active',1);*/
			$(window).resize();
		},
		loadOrderGridRender: function() {//dsMainFrame.workorderOPer.doQuery(1)
			//var objData = callRemoteFunctionNoTrans("com.ztesoft.iom.workorder.client.WorkOrderQueryClient",
			//"queryWorkOrderByCondForTask", conditionObj, pPage, pageSize, consQuery);
			var dcGridPerData = $.proxy(this.getOrderGridPerData,this); //函数作用域改变
			this.$("#orderMonitor-order-grid").grid({
				datatype: "json",
				height: 175,
				colModel: [{
					name: 'orderCode',
					label: '定单编码',
					width: 150
				}, {
					name: 'finishDate',
					width: 150,
					label: '定单完成期限'
				}, {
					name: 'orderClassName',
					label: '定单类型',
					width: 100
				}, {
					name: 'custOrderCode',
					label: '客户订单编码',
					width: 150
				}, {
					name: 'areaName',
					label: '区域',
					width: 100
				}, {
					name: 'orderTitle',
					label: '定单主题',
					width: 150
				}, {
					name: 'serviceName',
					label: '服务',
					width: 150
				}, {
					name: 'orderStateName',
					label: '定单状态',
					width: 150
				}, {
					name: 'id',
					label: 'id',
					width: 100,
					hidden:true
				}],
				rowNum: 10,
				pager: true,
				server: true,
				multiselect:false,
				shrinkToFit:false,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getOrderGridPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			var workOrderList = {
				"rows": [],
				"page": 1,
				"total": 0,
				"id": "id"
			};
			this.$("#orderMonitor-workOrder-grid").grid("reloadData", workOrderList);
			rowNum = rowNum || this.$("#orderMonitor-order-grid").grid("getGridParam", "rowNum");
			var me =this;
			var qryConditionDto = {
				
			};
			var formValue = $('#orderMonitor-Qryform').form("value")
			if(formValue["orderMonitor-orderCode"] != undefined && formValue["orderMonitor-orderCode"] != ''){
				qryConditionDto.orderCode = formValue["orderMonitor-orderCode"];
			}
			if(formValue["orderMonitor-custOrderCode"] != undefined && formValue["orderMonitor-custOrderCode"] != ''){
				qryConditionDto.custOrderCode = formValue["orderMonitor-custOrderCode"];
			}
			if(formValue["orderMonitor-workOrderCode"] != undefined && formValue["orderMonitor-workOrderCode"] != ''){
				qryConditionDto.workOrderCode = formValue["orderMonitor-workOrderCode"];
			}
			if(formValue["orderMonitor-accNbr"] != undefined && formValue["orderMonitor-accNbr"] != ''){
				qryConditionDto.accNbr = formValue["orderMonitor-accNbr"];
			}
			if(formValue["orderMonitor-workOrderCode"] != undefined && formValue["orderMonitor-workOrderCode"] != ''){
				qryConditionDto.workOrderState = formValue["orderMonitor-workOrderState"];
			}
			if(formValue["orderMonitor-tacheName"] != undefined && formValue["orderMonitor-tacheName"] != ''){
				qryConditionDto.tacheName = formValue["orderMonitor-tacheName"];
			}
			if(formValue["orderMonitor-startTime"] != undefined && formValue["orderMonitor-startTime"] != ''){
				qryConditionDto.startDate = formValue["orderMonitor-startTime"];
			}
			utils.ajax('orderTaskManage','qryOrderInfo',qryConditionDto,page || 1,rowNum).done(function(ret){
				me.$("#orderMonitor-order-grid").grid("reloadData", ret);
			});

			
	},loadWorkOrderGridRender: function() {//dsMainFrame.workorderOPer.doQuery(1)
			//var objData = callRemoteFunctionNoTrans("com.ztesoft.iom.workorder.client.WorkOrderQueryClient",
			//"queryWorkOrderByCondForTask", conditionObj, pPage, pageSize, consQuery);
			this.$("#orderMonitor-workOrder-grid").grid({
				datatype: "json",
				height: 170,
				colModel: [{
					name: 'workOrderCode',
					label: '工单编码',
					width: 150
				}, {
					name: 'partyName',
					label: '执行单位',
					width: 150
				}, {
					name: 'tacheName',
					width: 150,
					label: '环节名称'
				}, {
					name: 'workOrderStateName',
					width: 150,
					label: '工单状态'
				}, {
					name: 'createDate',
					width: 150,
					label: '创建时间'
				}, {
					name: 'finishDate',
					width: 150,
					label: '完成时间'
				}, {
					name: 'remarks',
					width: 200,
					label: '备注'
				}, {
					name: 'serviceOrderId',
					width: 100,
					label: 'serviceOrderId',
					hidden:true
				}, {
					name: 'tacheDefineId',
					width: 100,
					label: 'TacheDefineId',
					hidden:true
				}, {
					name: 'baseOrderId',
					width: 100,
					label: 'BaseOrderId',
					hidden:true
				}, {
					name: 'id',
					width: 100,
					label: 'Id',
					hidden:true
				}],
				rowNum: 10,
				pager: false,
				server: true,
				multiselect:false,
				shrinkToFit:false
			});
	},orderSearch:function(){
			this.getOrderGridPerData();
	},workorderDetailsOper:function(){
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				fish.info({title:'提示',message:selected.startTime});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请选择一条记录！'});
			}

	},orderDetailsOper:function(){
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var pop =fish.popupView({url: 'modules/order/views/OrderDetailsView',
					width: "70%",height:'460',viewOption:{action:"detail.spacerm-dc",baseOrderId:selected.baseOrderId},
					callback:function(popup,view){
						popup.result.then(function (e) {
							alert("e=" + e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请选择一条记录！'});
			}
	},resourceConfigOper:function(){
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var pop =fish.popupView({url: 'modules/idcrm/rmconfig/views/ResourceConfigView',
					width: "70%",height:'460',viewOption:{action:"detail.spacerm-dc",baseOrderId:selected.baseOrderId},
					callback:function(popup,view){
						popup.result.then(function (e) {
							alert("e=" + e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请选择一条记录！'});
			}
	},feedbackOper:function(){
		var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
		if(!selections||selections.length <=0)return false;
		selected =_.filter(selected,function(o){return o.workOrderState =='10I'||o.workOrderState =='10D'||o.workOrderState =='10G';})
		if(!selections||selections.length <=0){
			fish.info({title:'提示',message:'只能对状态为处理中、已派发、已提单的工单做回单操作'});
		}
		else{
			var selected = selections;
			
			
			var getMyAgencyPerData =$.proxy(this.getMyAgencyPerData,this);
			fish.popupView({url: 'modules/order/views/FinishWorkOrderView',
				width: "60%",
				viewOption:{
					orders : selections,
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyAgencyPerData();
						//console.log(e);
					},function (e) {
						//console.log('关闭了',e);
					});
				}
			});
		}
			
	},returnOper:function(){
		var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
		if(!selections||selections.length <=0){
			//fish.info({title:'提示',message:'回单'});
		}
		else if(selections.length == 1){
			var selected = selections[0];
			if(!(selected.workOrderState =='10I'||selected.workOrderState =='10D'||selected.workOrderState =='10G')){
				fish.info({title:'提示',message:'只能对状态为处理中、已派发、已提单的工单做退单操作'});
				return false;
			}
			
			var getMyAgencyPerData =$.proxy(this.getMyAgencyPerData,this);
			fish.popupView({url: 'modules/order/views/ReturnWorkOrderView',
				width: "60%",
				viewOption:{
					order : selections[0],
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyAgencyPerData();
						//console.log(e);
					},function (e) {
						//console.log('关闭了',e);
					});
				}
			});
		}
		
		else if(selections.length > 1){
			fish.info({title:'提示',message:'一次只能操作一条记录！'});
		}
	},selectTaskClick:function(){
			var me = this;
			var selected = this.$("#orderMonitor-order-grid").grid("getSelection");//返回所有被选中的行
			if(selected){
				utils.ajax('orderTaskManage','qryWorkOrderInfoByOrderId',selected.id).done(function(ret){
				var result = {
					"rows": ret,
					"page": 1,
					"total": ret.length,
					"id": "id"
				};
				me.$("#orderMonitor-workOrder-grid").grid("reloadData", result);
			});
			}
	},feedbackOper:function(){
		var me = this;
		var selected = this.$("#orderMonitor-workOrder-grid").grid("getSelection");//返回所有被选中的行
		if(selected && selected.id){
			var workOrderIds = [];
			workOrderIds[0] = selected.id;
			 var fnWOs =[];
			 for(var index=0;index<workOrderIds.length;index++ ){
				 var dto={
						 workOrderId:workOrderIds[index],
						 operFinishDate: new Date(),
						 operId:currentUser.staffId,
						 operName:currentUser.staffName,
						 dealResult:'人工强制回单'
				 };
				 fnWOs.push(dto);
			 }
			 var me =this;var popup=this.popup;
			 utils.ajax('iomService','finishWorkOrders',fnWOs).done(function(ret){
				 fish.info({title:'提示',message:'回单成功！'});
				 this.selectTaskClick();
			 }).fail(function(){
				 fish.error({title:'回单失败',message:'回单失败'}).result.always(function(ret){
					 popup.close(ret);
				 });
			 });
		}else{
			fish.info({title:'提示',message:'请选择一条记录！'});
		}
	}
	});
});