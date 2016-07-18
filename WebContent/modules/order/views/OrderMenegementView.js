define([
	'text!modules/order/templates/OrderMenegementView.html'+codeVerP,
	'i18n!modules/order/i18n/order.i18n',
	'modules/common/cloud-utils',
	'css!modules/order/styles/ordermanagement.css'+codeVerP
], function(AgencyMenegementViewTpl, i18nAgency,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(AgencyMenegementViewTpl),
		i18nData: fish.extend({}, i18nAgency),
		events: {
			'click #order-search-btn':'orderSearch',
			'click #order-task-grid': 'selectTaskClick'
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
			
			this.loadMyAgencyRender();
			this.getMyAgencyPerData();

			//时间控件
			$("#order-startTime").datetimepicker({
				buttonIcon: '',
				changeMinute: function (e, value) {
					console.log("changeMinute:" + value.date);
				},
				changeHour: function (e, value) {
					console.log("changeHour:" + value.date);
				},
				changeDay: function (e, value) {
					console.log("changeDay:" + value.date);
				},
				changeMonth: function (e, value) {
					console.log("changeMonth:" + value.date);
				},
				changeYear: function (e, value) {
					console.log("changeYear:" + value.date);
				},
				changeDate: function (e, value) {
					console.log("changeDate:" + value.date);
				},
				outOfRange: function (e, value) {
					console.log("outOfRange:" + value.date + ":" + value.startDate);
				}
			});
			$("#order-startTime").on('datetimepicker:hide', function (e) {
				console.log('hide');
			});
			$("#order-startTime").on('datetimepicker:show', function (e) {
				console.log('show');
			});
			//初始化环节按钮

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
		loadMyAgencyRender: function() {//dsMainFrame.workorderOPer.doQuery(1)
			//var objData = callRemoteFunctionNoTrans("com.ztesoft.iom.workorder.client.WorkOrderQueryClient",
			//"queryWorkOrderByCondForTask", conditionObj, pPage, pageSize, consQuery);
			var dcGridPerData = $.proxy(this.getMyAgencyPerData,this); //函数作用域改变
			this.$("#order-task-grid").grid({
				datatype: "json",
				height: 300,
				colModel: [{
					name: 'orderCode',
					label: '定单编码',
					width: 150
				}, {
					name: 'finishDate',
					width: 150,
					label: '定单完成期限'
				}, {
					name: 'tacheName',
					label: '环节名称',
					width: 150
				}, {
					name: 'workOrderCode',
					label: '工单编码',
					width: 150
				}, {
					name: 'accNbr',
					label: '业务号码',
					width: 150
				}, {
					name: 'workOrderStateName',
					label: '工单状态',
					width: 100
				}, {
					name: 'workOrderTypeName',
					label: '工单类型',
					width: 100
				}, {
					name: 'orderTypeName',
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
				}, {
					name: 'baseOrderId',
					label: 'baseOrderId',
					width: 100,
					hidden:true
				}, {
					name: 'tacheDefineId',
					label: 'tacheDefineId',
					width: 100,
					hidden:true
				}, {
					name: 'processInstanceId',
					label: 'processInstanceId',
					width: 100,
					hidden:true
				}],
				rowNum: 10,
				pager: true,
				server: true,
				multiselect:true,
				shrinkToFit:false,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		getMyAgencyPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#order-task-grid").grid("getGridParam", "rowNum");
			var me =this;
			var qryConditionDto = {
				'staffId':currentUser.staffId,
				'jobId':currentJob.jobId,
				'qualifiedJobIds':currentJob.jobId,
				'qualifiedOrgIds':currentJob.orgId
			};
			var formValue = $('#order-Qryform').form("value")
			if(formValue["order-orderCode"] != undefined && formValue["order-orderCode"] != ''){
				qryConditionDto.orderCode = formValue["order-orderCode"];
			}
			if(formValue["order-custOrderCode"] != undefined && formValue["order-custOrderCode"] != ''){
				qryConditionDto.custOrderCode = formValue["order-custOrderCode"];
			}
			if(formValue["order-workOrderCode"] != undefined && formValue["order-workOrderCode"] != ''){
				qryConditionDto.workOrderCode = formValue["order-workOrderCode"];
			}
			if(formValue["order-accNbr"] != undefined && formValue["order-accNbr"] != ''){
				qryConditionDto.accNbr = formValue["order-accNbr"];
			}
			if(formValue["order-workOrderState"] != undefined && formValue["order-workOrderState"] != ''){
				qryConditionDto.workOrderState = formValue["order-workOrderState"];
			}
			if(formValue["order-tacheName"] != undefined && formValue["order-tacheName"] != ''){
				qryConditionDto.tacheName = formValue["order-tacheName"];
			}
			if(formValue["order-startTime"] != undefined && formValue["order-startTime"] != ''){
				qryConditionDto.startDate = formValue["order-startTime"];
			}
			utils.ajax('iomService','qryTaskDatas',qryConditionDto,page || 1,rowNum,false).done(function(ret){
				/*var result = {
						"rows": ret,
						"page": page,
						"total": 1,
						"id": "id"
					};*/
				me.$("#order-task-grid").grid("reloadData", ret);
			});

			
		},popAddAgent:function(){
		var getMyAgencyPerData=$.proxy(this.getMyAgencyPerData,this);
		var pop =fish.popupView({url: 'modules/agency/views/AgentFormView',
			width: "60%",
			
			callback:function(popup,view){
				popup.result.then(function (e) {
					utils.ajax('isaService','addAgency',currentUser.staffId,e.agent.id,e.agent.text,e['agent-starttime'],e['agent-endtime'])
					.done(function(){
						fish.info('保存成功');
						getMyAgencyPerData();
						
					}).fail(function(e){
						console.log(e);
						fish.error(e);
					});
					console.log(e);
				},function (e) {
					console.log('关闭了',e);
				});
			}
		});
	},orderSearch:function(){
			this.getMyAgencyPerData();
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
					width: "70%",height:'460',viewOption:{action:"detail.spacerm-dc",baseOrderId:selected.baseOrderId,operation:'config'},
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
	},lookResourceConfigOper:function(){
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var pop =fish.popupView({url: 'modules/idcrm/rmconfig/views/ResourceConfigView',
					width: "70%",height:'460',viewOption:{action:"detail.spacerm-dc",baseOrderId:selected.baseOrderId,operation:'look'},
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
	},showFlow:function(){
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				utils.ajax('orderTaskManage','qryFlowSystemInfo').done(function(flowSysInfo){
					var flowhtml = '<div class="ui-dialog ui-draggable">'
							+'<div class="modal-header">'
							+'<h4 class="modal-title">流程图</h4>'
							+'</div>'
							+'<div class="modal-body">'
							+'<iframe src="http://' + flowSysInfo.ip + ':' + flowSysInfo.port + '/uos-manager/flowInst.html?processInstId=' + selected.processInstanceId + '" width="100%" height="98%"></iframe>'
							+'</div></div>';
					var options = {
						height: "450",
						width:"70%",
						modal: false,
						draggable: false,
						content: $(flowhtml),
						autoResizable: true
					};
					fish.popup(options).show();
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请选择一条记录！'});
			}
	},selectTaskClick:function(){
			//初始化环节按钮
			var selections = this.$("#order-task-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				if(this.order_task_grid_last_select_id == selected.id){
					return;
				}else{
					this.order_task_grid_last_select_id = selected.id;
				}
				$("#btnDiv").empty();
				var me1 = this;
				utils.ajax('iomService','qryButtonsByTacheId',selected.tacheDefineId,selected.id).done(function(buttons){
					if(buttons != null && buttons != undefined){
						for(var i = 0;i < buttons.length;i++){
							var button = buttons[i];
							var div=$('<button>');         //创建一个div
							div.attr('id','tacheBtn' + button.id);    //给div设置id
							div.attr('class','btn btn-primary pull-left');    //给div设置样式
							div.attr('type','button');
							div.attr('click',button.buttonClick);
							div.append(button.buttonName);
							$('#btnDiv').append(div);
							var me2 = me1;
							$('#tacheBtn' + button.id).on('click', function () {
								eval("me2." + this.attributes.click.value+"()");
							})
						}
					}
				});
			}
	}
	});
});