define([
	'text!modules/isa/stoppage/operation/myWorkorderList/templates/myWorkorderListView.html',
	'i18n!modules/isa/stoppage/operation/myWorkorderList/i18n/operation.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/stoppage/operation/myWorkorderList/styles/operationmanagement.css'
], function(OperationMenegementViewTpl, i18nOperation,utils,css) {
	var playFlag=-1;
	var isaMonAutoSum;
	return fish.View.extend({
		template: fish.compile(OperationMenegementViewTpl),
		i18nData: fish.extend({}, i18nOperation),
		events: {
			"click #operation-tabs-receive-link": "operationTabsReceiveClick",//待接收区
			"click #operation-tabs-pending-link": "operationTabsPendingClick",//待处理区
			"click #operation-tabs-processed-link": "operationTabsProcessedClick",//已处理区
			"click #operation-tabs-copyTo-link": "operationTabsCopyToClick",//抄送区
			"click #ope_pro_sel_btn": "get_ope_pro_sel_btn",//待办查询
			"click #ope_copy_sel_btn": "get_ope_copy_sel_btn",//抄送查询
			"click #operation_workOrderInfo_btn": "operation_workOrderInfo_btn",//待办详情
			"click #ope_pro_workOrderInfo_btn": "ope_pro_workOrderInfo_btn",//已办详情
			"click #operation_distribute_btn": "operation_distribute_btn",//工单派发
			"click #operation_distribute_dis_filing_btn":"operation_distribute_dis_filing_btn",//预派发
			"click #operation_trans_btn": "operation_trans_btn",//转派
			"click #operation_adddispatchreason_btn": "operation_adddispatchreason_btn",//加派
			"click #operation_feedback_btn": "operation_feedback_btn",//反馈
			"click #operation_finish_btn": "operation_finish_btn",//回单
			"click #operation_back_order_btn": "operation_back_order_btn",//退单
			"click #operation_recover_btn": "operation_recover_btn",//恢复确认
			"click #showDivBtn": "showDivBtn",//隐藏按钮
			'click #operation-sel-btn':'getMyoperationPerData',//已办查询
			'click #operation-sel-btntab0':'getMyoperationPerDatatab0',//接收查询
			"click #ope_pro_workOrderInfo_btn4Copy":"ope_pro_workOrderInfo_btn4Copy",//抄送详情
			"click #operation_hangUp_btn":"operation_hangUp_btn",//挂起申请
			'click #isa_operation_sel_btn_advSearchBtntab0': 'isa_operation_sel_btn_advSearchBtntab0',  //待办高级查询按钮事件
			'click #isa_operation_sel_btn_advSearchBtn': 'isa_operation_sel_btn_advSearchBtn',  //待办高级查询按钮事件
			'click #isa_ope_pro_sel_btn_advSearchBtn': 'isa_ope_pro_sel_btn_advSearchBtn',  //已办高级查询按钮事件
			'click #isa_ope_copy_sel_btn_advSearchBtn': 'isa_ope_copy_sel_btn_advSearchBtn',  //抄送高级查询按钮事件
			"click #operation_upgrade_btn":"operation_upgrade_btn",//升级通知
			"click #operation_signIn_btn":"operation_signIn_btn",//签收
			"click #operation_workOrderInfo_btntab0":"operation_workOrderInfo_btntab0",//接收详情
			"click #operation_colse_btntab0":"operation_colse_btntab0" //关闭声音
		},
		
		//这里用来进行dom操作 
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			var me =this;
			var uosConfigMap = new Object();
			uosConfigMap.name="SEVERE_TIMEOUT";
			utils.ajax('isaCommonService','queUosConfig',uosConfigMap).done(function(ret){
				document.getElementById("operation_distribute_severity_date_value").value=ret.rows[0].value;
				document.getElementById("operation_distribute_severity_date_valuetab0").value=ret.rows[0].value;
    		});
			//this.operationTabsReceiveClick();
			this.loadMyoperationRendertab0();
			this.getMyoperationPerDatatab0();
			this.loadMyoperationRender();
			this.loadMyoperationRenderProcessed();
			this.loadMyoperationRenderCopy();
			this.showDivBtn();
			this.isa_operation_sel_btn_advSearchBtn();
			this.isa_ope_pro_sel_btn_advSearchBtn();
			this.isa_ope_copy_sel_btn_advSearchBtn();
			this.isa_operation_sel_btn_advSearchBtntab0();
			this.operation_colse_btntab0();
			this.$('#operation-tabs-receive').show();
			this.$('#operation-tabs-pending').hide();
			this.$('#operation-tabs-processed').hide();
			this.$('#operation-tabs-copyTo').hide();
			$("#operation_distribute_starttime,#operation_distribute_endtime,#operation_distribute_endtimetab0," +
					"#ope_pro_dis_startTime,#ope_pro_dis_endTime,#operation_distribute_starttimetab0," +
					"#ope_copy_dis_startTime,#ope_copy_dis_endTime").datetimepicker({
	            format: 'yyyy/mm/dd hh:ii:ss'
	        });
			
			
			$('#operation_fault_limit_date,#ope_pro_fau_limit_date,#ope_copy_fau_limit_date,#operation_fault_limit_datetab0').combobox({
	            dataSource: [
	                {"name": "未超时", "value": "0"},
	                {"name": "已告警", "value": "1"},
	                {"name": "已超时", "value": "2"},
	                {"name": "严重超时", "value": "3"},
	            ]
	        });
			
			
			
			//派发人员
			$('#operation_distribute_staff,#operation_distribute_stafftab0').popedit({
				dataTextField :'text',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
    					title:'选择处理人',
    					orgId:currentJob.orgPathCode.split('.')[0],
    				},
				},
				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
				showClearIcon:false
			});
			
			//获得静态数据
			utils.ajax('isaCommonService','selStaticData').done(function(ret){
				
				//受理渠道
				var faultSourceDtoList = ret.faultSourceDtoList;
				//紧急程度
				var faultErmgLevelDtoList = ret.faultErmgLevelDtoList;
				//故障分类
				var faultPhenomenaDtoList = ret.faultPhenomenaDtoList;
				//产品分类
				var faultKindDtoList = ret.faultKindDtoList;
				//障碍类型
				var faultTypeDtoList = ret.faultTypeDtoList;
				//平台类型
				var faultPlatTypeDtoList = ret.faultPlatTypeDtoList;
				//告警源
				var faultAlarmSourceDtoList = ret.faultAlarmSourceDtoList;
				//故障级别
				var faultGradeDtoList = ret.faultGradeDtoList;
				//资源池
				var faultResPoolDtoList = ret.faultResPoolDtoList;
				
				//查询受理渠道
				$('#operation_acceptance_channel,#ope_pro_acc_channel,#ope_copy_acc_channel,#operation_acceptance_channeltab0').combobox({
    				editable : 'false',
			        dataTextField: 'name',
			        dataValueField: 'value',
			        dataSource: faultSourceDtoList,
			    });
				
				//紧急程度
				$('#isa_sto_ope_myw_dis_faultErmgLevelId').combobox({
					dataTextField: 'name',
					dataValueField: 'value',
					dataSource: faultErmgLevelDtoList,
				});
				
				//故障分类
				/*$('#operation_question_type,#ope_pro_que_type,#ope_copy_que_type').combobox({
			        dataTextField: 'name',
			        dataValueField: 'value',
			        dataSource: faultPhenomenaDtoList,
			    });*/
				
				$('#operation_question_type,#ope_pro_que_type,#ope_copy_que_type,#operation_question_typetab0').popedit({
					dataTextField :'text',
    				dataValueField :'faultPhenomenaId',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择故障分类',
        					orgId:'1',
        				},
    				},
    				
					url:'js!modules/isa/stoppage/operation/common/views/FaultPhenomenaTree',
    				showClearIcon:false
    			});
				
				//查询产品类型
				$('#operation_product_type,#ope_pro_pro_type,#ope_copy_pro_type,#operation_product_typetab0').combobox({
			        dataTextField: 'name',
			        dataValueField: 'value',
			        dataSource: faultKindDtoList,
			    });
				//障碍级别
				$('#isa_sto_ope_myw_dis_faultLevel').combobox({
			        dataTextField: 'name',
			        dataValueField: 'value',
			        dataSource: faultGradeDtoList,
			    });
				
				//资源池
				$('#isa_sto_ope_myw_dis_faultResPoolId').combobox({
			        dataTextField: 'name',
			        dataValueField: 'value',
			        dataSource: faultResPoolDtoList,
			    });
				
				//查询故障级别
				$('#operation_warning_source,#ope_pro_warn_source,#ope_copy_warn_source,#operation_warning_sourcetab0').combobox({
					dataTextField: 'name',
					dataValueField: 'value',
					dataSource: faultGradeDtoList
				});
				
    		});
			
			
			var isaMonAutoQuery;
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			//定时扫描监控单子
			$("#isa_sto_ope_myw_pending_autoQryOrder").change(function() {
				if($('#isa_sto_ope_myw_pending_autoQryOrder').is(':checked')) {
					var minute = document.getElementById("isa_sto_ope_myw_pending_minuteRefresh").value;
					//必须大于五分钟
					if(!isNaN(minute) && minute<2){
						fish.info("刷新间隔必须大于2分钟");
						return;
					}
					isaMonAutoQuery = window.setInterval(function(){
						var obj ;
						getMyoperationPerData(0,10,1,1);
					},minute*60*1000); 
					
					me.registerThread(isaMonAutoQuery);
				}else{
					//去掉定时器的方法 
					
					window.clearInterval(isaMonAutoQuery);						
				}
			});
			
			
			var isaMonAutoQuerytab0;
			var getMyoperationPerDatatab0 = $.proxy(this.getMyoperationPerDatatab0,this);
			//定时扫描监控单子
			$("#isa_sto_ope_myw_pending_autoQryOrdertab0").change(function() {
				if($('#isa_sto_ope_myw_pending_autoQryOrdertab0').is(':checked')) {
					//必须大于两分钟
					var minute = document.getElementById("isa_sto_ope_myw_pending_minuteRefreshtab0").value;
					if(!isNaN(minute) && minute<2){
						fish.info("刷新间隔必须大于2分钟");
						return;
					}
					
					isaMonAutoQuerytab0 = window.setInterval(function(){
						var obj ;
						getMyoperationPerDatatab0(0,10,1,1);
						
					},minute*60*1000); 
					
					me.registerThread(isaMonAutoQuerytab0);
				}else{
					//去掉定时器的方法 
					window.clearInterval(isaMonAutoQuerytab0);						
				}
			});
			//定时刷新声音
			
		},
		//待办高级查询按钮事件
		isa_operation_sel_btn_advSearchBtntab0: function() { 
			var expand = $("#isa_operation_sel_btn_advSearchBtntab0").attr("expand");
			if (expand == "false") { //展开
				$(".isa_operation_sel_advSearchFields_rowtab0").show("fast");
				$("#isa_operation_sel_btn_advSearchBtntab0").attr("expand","true");
				$("#isa_operation_sel_btn_advSearchBtntab0").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#operation-myoperation-grid-pendingtab0").grid("setGridHeight", $('#main-tabs-panel').height() - 160);
				$("#operation-tabs-receive").removeAttr("style");
			} else { //收起
				$(".isa_operation_sel_advSearchFields_rowtab0").hide("fast");
				$("#isa_operation_sel_btn_advSearchBtntab0").attr("expand","false");
				$("#isa_operation_sel_btn_advSearchBtntab0").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#operation-myoperation-grid-pendingtab0").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				$("#operation-tabs-receive").attr("style","padding-bottom: 0px;");
			}
		},
		//待办高级查询按钮事件
		isa_operation_sel_btn_advSearchBtn: function() { 
			var expand = $("#isa_operation_sel_btn_advSearchBtn").attr("expand");
			if (expand == "false") { //展开
				$(".isa_operation_sel_advSearchFields_row").show("fast");
				$("#isa_operation_sel_btn_advSearchBtn").attr("expand","true");
				$("#isa_operation_sel_btn_advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#operation-myoperation-grid-pending").grid("setGridHeight", $('#main-tabs-panel').height() - 160);
				$("#operation-tabs-pending").removeAttr("style");
			} else { //收起
				$(".isa_operation_sel_advSearchFields_row").hide("fast");
				$("#isa_operation_sel_btn_advSearchBtn").attr("expand","false");
				$("#isa_operation_sel_btn_advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#operation-myoperation-grid-pending").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				$("#operation-tabs-pending").attr("style","padding-bottom: 0px;");
			}
		},
		//已办高级查询按钮事件
		isa_ope_pro_sel_btn_advSearchBtn: function() { 
			var expand = $("#isa_ope_pro_sel_btn_advSearchBtn").attr("expand");
			if (expand == "false") { //展开
				$(".isa_ope_pro_sel_advSearchFields_row").show("fast");
				$("#isa_ope_pro_sel_btn_advSearchBtn").attr("expand","true");
				$("#isa_ope_pro_sel_btn_advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#operation-myoperation-grid-processed").grid("setGridHeight", $('#main-tabs-panel').height() - 160);
				$("#operation-tabs-processed").removeAttr("style");
			} else { //收起
				$(".isa_ope_pro_sel_advSearchFields_row").hide("fast");
				$("#isa_ope_pro_sel_btn_advSearchBtn").attr("expand","false");
				$("#isa_ope_pro_sel_btn_advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#operation-myoperation-grid-processed").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				$("#operation-tabs-processed").attr("style","padding-bottom: 0px;");
			}
		},
		//抄送高级查询按钮事件
		isa_ope_copy_sel_btn_advSearchBtn: function() { 
			var expand = $("#isa_ope_copy_sel_btn_advSearchBtn").attr("expand");
			if (expand == "false") { //展开
				$(".isa_ope_copy_sel_advSearchFields_row").show("fast");
				$("#isa_ope_copy_sel_btn_advSearchBtn").attr("expand","true");
				$("#isa_ope_copy_sel_btn_advSearchBtn").html('  收起  <span class="glyphicon glyphicon-chevron-up"></span>');
				$("#operation-myoperation-grid-copyTo").grid("setGridHeight", $('#main-tabs-panel').height() - 160);
				$("#operation-tabs-copyTo").removeAttr("style");
			} else { //收起
				$(".isa_ope_copy_sel_advSearchFields_row").hide("fast");
				$("#isa_ope_copy_sel_btn_advSearchBtn").attr("expand","false");
				$("#isa_ope_copy_sel_btn_advSearchBtn").html('高级查询 <span class="glyphicon glyphicon-chevron-down"></span>');
				$("#operation-myoperation-grid-copyTo").grid("setGridHeight", $('#main-tabs-panel').height() - 90);
				$("#operation-tabs-copyTo").attr("style","padding-bottom: 0px;");
			}
		},
		//待接收
		operationTabsReceiveClick:function(){
			this.$('#operation-tabs-receive').show();
			this.$('#operation-tabs-pending').hide();
			this.$('#operation-tabs-processed').hide();
			this.$('#operation-tabs-copyTo').hide();
			this.$('#operation-tabs-receive-li').addClass('ui-tabs-active');
			this.$('#operation-tabs-pending-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-processed-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').removeClass('ui-tabs-active');
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			$(window).resize();
			this.getMyoperationPerDatatab0();
		},
		//待办
		operationTabsPendingClick:function(){
			this.$('#operation-tabs-receive').hide();
			this.$('#operation-tabs-pending').show();
			this.$('#operation-tabs-processed').hide();
			this.$('#operation-tabs-copyTo').hide();
			this.$('#operation-tabs-receive-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-pending-li').addClass('ui-tabs-active');
			this.$('#operation-tabs-processed-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').removeClass('ui-tabs-active');
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			$(window).resize();
			this.getMyoperationPerData();
			
		},
		//已办
		operationTabsProcessedClick:function(){
			this.$('#operation-tabs-receive').hide();
			this.$('#operation-tabs-pending').hide();
			this.$('#operation-tabs-processed').show();
			this.$('#operation-tabs-copyTo').hide();
			this.$('#operation-tabs-receive-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-pending-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-processed-li').addClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').removeClass('ui-tabs-active');
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			$(window).resize();
			this.get_ope_pro_sel_btn();
			
			
		},
		//抄送
		operationTabsCopyToClick:function(){
			this.$('#operation-tabs-receive').hide();
			this.$('#operation-tabs-pending').hide();
			this.$('#operation-tabs-processed').hide();
			this.$('#operation-tabs-copyTo').show();
			this.$('#operation-tabs-receive-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-pending-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-processed-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').addClass('ui-tabs-active');
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			$(window).resize();
			this.get_ope_copy_sel_btn();
		},
		//待接收
		loadMyoperationRendertab0: function() {
			me=this;
			this.$("#operation-myoperation-grid-pendingtab0").grid({
				datatype: "json",
				height: 400,
				
			colModel: [{name: 'alertStatus',label: '告警状态',width: 80,sortable:false,align:"center"},
			           {name: 'orderTitle',label: '故障标题',sortable:false,width: 150}, 
			           {name: 'faultGradeName',label: '故障级别',sortable:false,width: 100}, 
			           {name: 'orderCode',width: 150,sortable:false,label: '故障编号'}, 
			           {name: 'tacheName',label: '环节',sortable:false,width: 80},  
			           {name: 'extStateNameOrder',label: '工单状态',width: 80,sortable:false,hidden:true},  
			           {name: 'extStateName',label: '工单状态',sortable:false,width: 80},   
			           {name: 'workStationName',label: '工单状态',width: 80,hidden:true},   
			           {name: 'createDate',label: '派发时间',sortable:false,width: 150},  
			           {name: 'alertDate',label: '告警时间',sortable:false,width: 150},  
			           {name: 'limitDate',label: '截至时间',sortable:false,width: 150}, 
			           {name: 'dispStaffName',label: '派发人',sortable:false,width: 80},
			           {name: 'partyName',label: '执行人',sortable:false,width: 80}, 
			           {name: 'id',width: 100,label: '工单Id',key:true,hidden:true}, 
			           {name: 'workOrderCode',width: 10,label: '工单编码',hidden:true}, 
			           {name: 'tacheCode',width: 10,label: '环节编码',hidden:true},  
			           {name: 'processinstanceid',width: 100,label: '流程实例id',hidden:true},
			           {name: 'baseOrderId',width: 100,label: '订单Id',hidden:true},
			           {name: 'extState',width: 100,label: '订单状态',hidden:true},
			           {name: 'isPause',width: 100,label: '挂起状态',hidden:true},
			           {name: 'workOrderState',width: 100,label: '工单状态',hidden:true}],
				multiselect: true,
				rowNum: 10,
				pager: true,
				server: true,
				showColumnsFeature: true, //允许用户自定义列展示设置
				pageData: this.getMyoperationPerDatatab0,
				gridview:false,
				shrinkToFit:false,//不随着外部容器定义宽度
				onSelectRow:$.proxy(this.showDivBtn,this),
				onChangRow:$.proxy(this.showDivBtn,this),
				cached: true, 
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#operation-myoperation-grid-pendingtab0").grid("setCheckRows",[rowid]);
					} 
				},
				afterInsertRow: function(e, rowid, aData){
					switch (aData.limitState) {
					case '超时':
						jQuery("#operation-myoperation-grid-pendingtab0").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;text-align:center;color:#DBAA00" title="超时"></span>',{});
						break;
					case '告警':
						jQuery("#operation-myoperation-grid-pendingtab0").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;text-align:center;color:#abca02" title="预警"></span>',{});
						break;
					case '严重超时':
						jQuery("#operation-myoperation-grid-pendingtab0").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;text-align:center;color:#ea421b" title="严重超时"></span>',{});
						break;
					case '正常':
						jQuery("#operation-myoperation-grid-pendingtab0").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;text-align:center;color:#0085FF" title="正常"></span>',{});
						break;
					};
				}
			});
			
			$("#operation-myoperation-grid-pendingtab0").grid("navButtonAdd",[
  			    {
  			    	title: "严重超时",
  			        caption:" 严重超时",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-1"
  			    },
  			    {
  			    	title: "超时",
  			        caption:" 超时",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-2"
  			    },
  			    {
  			    	title: "预警",
  			        caption:" 预警",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-3"
  			    },
  			    {
  			    	title: "正常",
  			    	caption:" 正常",
  			    	buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-4"
  			    }
  			]);
			
		},
		//待处理区
		loadMyoperationRender: function() {
			var me=this;
			this.$("#operation-myoperation-grid-pending").grid({
				datatype: "json",
				height: 400,
				
			colModel: [{name: 'alertStatus',label: '告警状态',width: 80,sortable:false,align:"center"},
			           {name: 'orderTitle',label: '故障标题',sortable:false,width: 150}, 
			           {name: 'faultGradeName',label: '故障级别',sortable:false,width: 100}, 
			           {name: 'orderCode',width: 150,sortable:false,label: '故障编号'}, 
			           {name: 'tacheName',label: '环节',sortable:false,width: 80},  
			           {name: 'extStateNameOrder',label: '工单状态',width: 80,hidden:true},  
			           {name: 'extStateName',label: '工单状态',sortable:false,width: 80},   
			           {name: 'workStationName',label: '工单状态',width: 80,hidden:true},   
			           {name: 'createDate',label: '派发时间',sortable:false,width: 150},  
			           {name: 'alertDate',label: '告警时间',sortable:false,width: 150},  
			           {name: 'limitDate',label: '截至时间',sortable:false,width: 150}, 
			           {name: 'dispStaffName',label: '派发人',sortable:false,width: 80},
			           {name: 'partyName',label: '执行人',sortable:false,width: 80}, 
			           {name: 'id',width: 100,label: '工单Id',key:true,hidden:true}, 
			           {name: 'workOrderCode',width: 10,label: '工单编码',hidden:true}, 
			           {name: 'tacheCode',width: 10,label: '环节编码',hidden:true},  
			           {name: 'processinstanceid',width: 100,label: '流程实例id',hidden:true},
			           {name: 'baseOrderId',width: 100,label: '订单Id',hidden:true},
			           {name: 'extState',width: 100,label: '订单状态',hidden:true},
			           {name: 'isPause',width: 100,label: '挂起状态',hidden:true},
			           {name: 'workOrderState',width: 100,label: '工单状态',hidden:true}],
				//multiselect: true,
				rowNum: 10,
				pager: true,
				server: true,
				cached: true, 
				showColumnsFeature: true, //允许用户自定义列展示设置
				pageData: this.getMyoperationPerData,
				gridview:false,
				shrinkToFit:false,//不随着外部容器定义宽度
				onSelectRow:$.proxy(this.showDivBtn,this),
				onChangRow:$.proxy(this.showDivBtn,this),
				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
					 	var data=$("#operation-myoperation-grid-pending").grid("getSelection");
					 	me.operation_workOrderInfo_db(data);
				    },
				afterInsertRow: function(e, rowid, aData){
					switch (aData.limitState) {
					case '超时':
						jQuery("#operation-myoperation-grid-pending").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#DBAA00" title="超时"></span>',{});
						break;
					case '告警':
						jQuery("#operation-myoperation-grid-pending").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
						break;
					case '严重超时':
						jQuery("#operation-myoperation-grid-pending").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
						break;
					case '正常':
						jQuery("#operation-myoperation-grid-pending").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085FF" title="正常"></span>',{});
						break;
					};
				}
			});
			
			$("#operation-myoperation-grid-pending").grid("navButtonAdd",[
  			    {
  			    	title: "严重超时",
  			        caption:" 严重超时",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-1"
  			    },
  			    {
  			    	title: "超时",
  			        caption:" 超时",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-2"
  			    },
  			    {
  			    	title: "预警",
  			        caption:" 预警",
  			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-3"
  			    },
  			    {
  			    	title: "正常",
  			    	caption:" 正常",
  			    	buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-4"
  			    }
  			]);
			
		},
		
		showDivBtn:function (){
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			var operation_distribute_btn=document.getElementById('operation_distribute_btn');//工单派发
			var operation_distribute_dis_filing_btn = document.getElementById('operation_distribute_dis_filing_btn');//预处理
			var operation_trans_btn=document.getElementById('operation_trans_btn');//转派
			var operation_adddispatchreason_btn=document.getElementById('operation_adddispatchreason_btn');//加派
			var operation_feedback_btn=document.getElementById('operation_feedback_btn');//反馈
			var operation_finish_btn=document.getElementById('operation_finish_btn');//回单
			var operation_back_order_btn=document.getElementById('operation_back_order_btn');//退单
			var operation_recover_btn=document.getElementById('operation_recover_btn');//恢复确认
			var operation_hangUp_btn=document.getElementById('operation_hangUp_btn');//挂起申请
			var operation_upgrade_btn=document.getElementById('operation_upgrade_btn');//升级通知
			var isPause = getRowDataTemp.isPause;
			var tacheCode = getRowDataTemp.tacheCode;
			if(isPause == "1"){
				operation_distribute_btn.style.display="none";//工单派发
				operation_distribute_dis_filing_btn.style.display="none";//预处理
				operation_trans_btn.style.display="none";//转派
				operation_adddispatchreason_btn.style.display="none";//加派
				operation_feedback_btn.style.display="block";//反馈
				operation_finish_btn.style.display="none";//回单
				operation_recover_btn.style.display="none";//恢复确认
				operation_hangUp_btn.style.display="none";//挂起申请
				operation_upgrade_btn.style.display="none";//升级通知
				operation_back_order_btn.style.display="none";//退单
			}else if(tacheCode == 'YYGZ_PF'){//派发
				operation_distribute_btn.style.display="block";//工单派发
				operation_distribute_dis_filing_btn.style.display="block";//预处理
				operation_trans_btn.style.display="none";//转派
				operation_adddispatchreason_btn.style.display="none";//加派
				operation_feedback_btn.style.display="block";//反馈
				operation_finish_btn.style.display="none";//回单
				operation_recover_btn.style.display="none";//恢复确认
				operation_hangUp_btn.style.display="block";//挂起申请
				operation_upgrade_btn.style.display="block";//升级通知
				operation_back_order_btn.style.display="none";//退单
			}else if(tacheCode == 'YYGZ_CL'){//障碍处理
				operation_distribute_btn.style.display="none";//工单派发
				operation_distribute_dis_filing_btn.style.display="none";//预处理
				operation_trans_btn.style.display="block";//转派
				operation_adddispatchreason_btn.style.display="block";//加派
				operation_feedback_btn.style.display="block";//反馈
				operation_finish_btn.style.display="block";//回单
				operation_recover_btn.style.display="none";//恢复确认
				operation_hangUp_btn.style.display="block";//挂起申请
				operation_upgrade_btn.style.display="block";//升级通知
				operation_back_order_btn.style.display="block";//退单
			}else if(tacheCode == 'YYGZ_HFQR'){//恢复确认
				operation_distribute_btn.style.display="none";//工单派发
				operation_distribute_dis_filing_btn.style.display="none";//预处理
				operation_trans_btn.style.display="none";//转派
				operation_adddispatchreason_btn.style.display="none";//加派
				operation_feedback_btn.style.display="block";//反馈
				operation_finish_btn.style.display="none";//回单
				operation_recover_btn.style.display="block";//恢复确认
				operation_hangUp_btn.style.display="block";//挂起申请
				operation_upgrade_btn.style.display="block";//升级通知
				operation_back_order_btn.style.display="none";//退单
			}else {
				operation_distribute_btn.style.display="block";//工单派发
				operation_distribute_dis_filing_btn.style.display="block";//预处理
				operation_trans_btn.style.display="none";//转派
				operation_adddispatchreason_btn.style.display="none";//加派
				operation_feedback_btn.style.display="none";//反馈
				operation_finish_btn.style.display="none";//回单
				operation_recover_btn.style.display="none";//恢复确认
				operation_hangUp_btn.style.display="none";//挂起申请
				operation_upgrade_btn.style.display="none";//升级通知
				operation_back_order_btn.style.display="none";//退单
			}
		},
		playSound:function(){
			var VOICE_accept="<audio id='bgNewFault' width='0' height='0' border='0' src='../../Cloud-web/modules/isa/sound/003.wav' autoplay='autoplay' loop='true'></audio>";
			if(fish.browser.msie && fish.browser.version >= 9){
				VOICE_accept = "<EMBED id='bgNewFault' width='0' height='0' border='0' src='../../Cloud-web/modules/isa/sound/003.wav' autostart='true' loop='true' ></EMBED>";
			}
			playFlag=1;
			document.all["divaccept"].innerHTML=VOICE_accept;
		},
		stopSound:function(){
			playFlag=0;
			document.all["divaccept"].innerHTML="";
		},
		//待接收区
		getMyoperationPerDatatab0: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			var $form1 = $('#form-receive').form('value');
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			rowNum = rowNum || this.$("#operation-myoperation-grid-pendingtab0").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			map.createDateStart= $form1.operation_distribute_starttimetab0;//派发开始时间：
			map.createDateEnd= $form1.operation_distribute_endtimetab0;//派发结束时间：
			map.faultKindId= $form1.operation_product_typetab0;//产品类型：
			map.faultPhenomenaId= $form1.operation_question_typetab0;//问题类型：
			map.faultSourceId= $form1.operation_acceptance_channeltab0;//受理渠道：
			map.faultGradeId= $form1.operation_warning_sourcetab0;//故障级别
			map.orderCode= $form1.operation_fault_numbertab0;//故障编号：
			map.orderTitle= $form1.operation_fault_titletab0;//故障标题：
			map.dispStaffId= $form1.operation_distribute_stafftab0;//派发人员：
			map.limitDateFlag= $form1.operation_fault_limit_datetab0;//时限状态：
			if(""==$form1.operation_distribute_severity_date_valuetab0){
				map.severityDateValue=100;//告警严重超时时限
			}else{
				map.severityDateValue= $form1.operation_distribute_severity_date_valuetab0;//告警严重超时时限
			}
			map.orgId = currentJob.orgId;
			map.jobId = currentJob.jobId;
			map.staffId = currentUser.staffId;
			map.pageIndex = page;
			map.pageSize = rowNum;
			map.dutId = "22";
			map.state = "10A";
			map.extState = "2";
			var me =this;
			map.tabNum='1';
			utils.ajax('isaOperationFaultService','selStoppageWorkorderList',map).done(function(ret){
				//遍历查看当前集合中是否有新工单
				var total = 0 ;
				var rows=ret.rows;
				if(0==ret.records){
					me.stopSound();
				}
				if($("#operation-myoperation-grid-pendingtab0").is(':visible')){
					$("#operation-myoperation-grid-pendingtab0").grid("reloadData", ret);
                }
			});
		},
		//待处理区
		getMyoperationPerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			
			var VOICE_accept = "<EMBED id='bgNewFault' width='0' height='0' border='0' src='../../Cloud-web/modules/isa/sound/003.wav' autostart='true'  ></EMBED>";
			var newSoundFlagTemp = 0;
			var $form1 = $('#form-pending').form('value');
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			rowNum = rowNum || this.$("#operation-myoperation-grid-pending").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			map.createDateStart= $form1.operation_distribute_starttime;//派发开始时间：
			map.createDateEnd= $form1.operation_distribute_endtime;//派发结束时间：
			map.faultKindId= $form1.operation_product_type;//产品类型：
			map.faultPhenomenaId= $form1.operation_question_type;//问题类型：
			map.faultSourceId= $form1.operation_acceptance_channel;//受理渠道：
			map.faultGradeId= $form1.operation_warning_source;//故障级别：
			map.orderCode= $form1.operation_fault_number;//故障编号：
			map.orderTitle= $form1.operation_fault_title;//故障标题：
			map.dispStaffId= $form1.operation_distribute_staff;//派发人员：
			map.limitDateFlag= $form1.operation_fault_limit_date;//时限状态：
			if(""==$form1.operation_distribute_severity_date_value){
				map.severityDateValue=100;//告警严重超时时限
			}else{
				map.severityDateValue= $form1.operation_distribute_severity_date_value;//告警严重超时时限
			}
			map.orgId = currentJob.orgId;
			map.jobId = currentJob.jobId;
			map.staffId = currentUser.staffId;
			map.pageIndex = page;
			map.pageSize = rowNum;
			map.dutId = "22";
			map.state = "10A";
			map.extState = "2";
			map.tabNum='2';
			var me =this;
			utils.ajax('isaOperationFaultService','selStoppageWorkorderList',map).done(function(ret){
				//遍历查看当前集合中是否有新工单
				if($("#operation-myoperation-grid-pending").is(':visible')){
                    $("#operation-myoperation-grid-pending").grid("reloadData", ret);
                }
			});
		},
		
		//已处理区
		loadMyoperationRenderProcessed: function() {
			var me=this;
			this.$("#operation-myoperation-grid-processed").grid({
				datatype: "json",
				height: 400,
				colModel: [{name: 'alertStatus',label: '告警状态',sortable:false,width: 80,align:"center"},
				           {name: 'orderTitle',label: '故障标题',sortable:false,width: 220}, 
				           {name: 'faultGradeName',label: '故障级别',sortable:false,width: 100}, 
				           {name: 'orderCode',width: 200,sortable:false,label: '故障编号'}, 
				           {name: 'currentTacheName',label: '当前环节',sortable:false,width: 80}, 
				           //{name: 'tacheName',label: '当时工单环节',width: 80,hidden:true},
				           {name: 'extStateNameOrder',label: '故障单状态',sortable:false,width: 100},  
				          // {name: 'workStationName',label: '工单状态',width: 80,hidden:true},  
				           {name: 'createDateOrder',label: '创建时间',sortable:false,width: 150}, 
				           {name: 'alertDateOrder',label: '告警时间',sortable:false,width:150},  
				           {name: 'limitDateOrder',label: '截至时间',sortable:false,width: 150}, 
				           {name: 'id',width: 100,label: '订单Id',key:true,hidden:true}, 
				          // {name: 'workOrderCode',width: 10,label: '工单编码',hidden:true}, 
				           {name: 'processinstanceid',width: 100,label: '流程实例id',hidden:true}
				          //s {name: 'baseOrderId',width: 100,label: '订单Id',hidden:true}
				           ],
				rowNum: 10,
				pager: true,
				server: true,
				cached: true, 
				showColumnsFeature: true, //允许用户自定义列展示设置
				pageData: this.get_ope_pro_sel_btn,
				gridview:false,
				shrinkToFit:false,//不随着外部容器定义宽度
				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
				 	var data=$("#operation-myoperation-grid-processed").grid("getSelection");
				 	me.operation_workOrderInfo_dbtab2(data);
			    },
				afterInsertRow: function(e, rowid, aData){
					switch (aData.limitState) {
					case '超时':
						jQuery("#operation-myoperation-grid-processed").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#DBAA00" title="超时"></span>',{});
						break;
					case '告警':
						jQuery("#operation-myoperation-grid-processed").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
						break;
					case '严重超时':
						jQuery("#operation-myoperation-grid-processed").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
						break;
					case '正常':
						jQuery("#operation-myoperation-grid-processed").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085FF" title="正常"></span>',{});
						break;
					};
				}
			});
			$("#operation-myoperation-grid-processed").grid("navButtonAdd",[
			    {
			    	title: "严重超时",
			        caption:" 严重超时",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-1"
			    },
			    {
			    	title: "超时",
			        caption:" 超时",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-2"
			    },
			    {
			    	title: "预警",
			        caption:" 预警",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-3"
			    },
			    {
			    	title: "正常",
			    	caption:" 正常",
			    	buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-4"
			    }
			]);
			
		},
		
		
		//已处理区
		get_ope_pro_sel_btn: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			
			var $form1 = $('#form-processed').form('value');
			rowNum = rowNum || this.$("#operation-myoperation-grid-processed").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "selStoppageWorkorderList";
			
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			map.createDateStart= $form1.ope_pro_dis_startTime;//开始时间：
			map.createDateEnd= $form1.ope_pro_dis_endTime;//结束时间：
			
			map.faultKindId= $form1.ope_pro_pro_type;//产品类型：
			map.faultPhenomenaId= $form1.ope_pro_que_type;//问题类型：
			map.faultSourceId= $form1.ope_pro_acc_channel;//受理渠道：
			map.faultGradeId= $form1.ope_pro_warn_source;//故障：
			map.orderCode= $form1.ope_pro_fau_number;//故障编号：
			map.orderTitle= $form1.ope_pro_fau_title;//故障标题：
			map.limitDateFlag= $form1.ope_pro_fau_limit_date;//时限状态：
			var operation_distribute_severity_date_value = document.getElementById("operation_distribute_severity_date_value").value;
			if(""==operation_distribute_severity_date_value){
				map.severityDateValue=100;//告警严重超时时限
			}else{
				map.severityDateValue= operation_distribute_severity_date_value;//告警严重超时时限
			}
			map.orgId = currentJob.orgId;
			map.jobId = currentJob.jobId;
			map.staffId = currentUser.staffId;
			map.pageIndex = page;
			map.pageSize = rowNum;
			map.dutId = "22";
			map.state = "10A";
			map.extState = "4";
			var me =this;
			utils.ajax('isaOperationFaultService','selStoppageWorkorderList',map).done(function(ret){
				/*var total = ret[0];
				ret.shift(); 
				var result = {
						"rows": ret,
						"page": page,
						"total": total,
						"id": "id"
				};*/
				$("#operation-myoperation-grid-processed").grid("reloadData", ret);
			});
		},
		
		//阅读区
		loadMyoperationRenderCopy: function() {
			var me=this;
			this.$("#operation-myoperation-grid-copyTo").grid({
				datatype: "json",
				height: 400,
				colModel: [{name: 'alertStatus',label: '告警状态',sortable:false,width: 80,align:"center"},
				           {name: 'orderTitle',label: '故障标题',sortable:false,width: 220}, 
				           {name: 'faultGradeName',label: '故障级别',sortable:false,width: 100}, 
				           {name: 'orderCode',width: 200,sortable:false,label: '故障编号'}, 
				           {name: 'tacheName',label: '当前环节',sortable:false,width: 80},  
				           {name: 'extStateName',label: '故障单状态',sortable:false,width: 100},  
				           {name: 'createDate',label: '创建时间',sortable:false,width: 150},  
				           {name: 'alertDate',label: '告警时间',sortable:false,width: 150},  
				           {name: 'limitDate',label: '截至时间',sortable:false,width: 150}, 
				           {name: 'processinstanceid',width: 100,label: '流程实例Id',hidden:true}, 
				           {name: 'faultOrderCopyId',width: 100,label: '抄送表Id',key:true,hidden:true}, 
				           {name: 'id',width: 100,label: '订单Id',hidden:true}],
				rowNum: 10,
				pager: true,
				server: true,
				gridview:false,
				cached: true, 
				showColumnsFeature: true, //允许用户自定义列展示设置
				shrinkToFit:false,//不随着外部容器定义宽度
				pageData: this.get_ope_copy_sel_btn,
				onDblClickRow: function (e, rowid, iRow, iCol) {//双击行事件
				 	var data=$("#operation-myoperation-grid-copyTo").grid("getSelection");
				 	me.operation_workOrderInfo_dbtab3(data);
			    },
				afterInsertRow: function(e, rowid, aData){
					switch (aData.limitState) {
					case '超时':
						jQuery("#operation-myoperation-grid-copyTo").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#DBAA00" title="超时"></span>',{});
						break;
					case '告警':
						jQuery("#operation-myoperation-grid-copyTo").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#abca02" title="预警"></span>',{});
						break;
					case '严重超时':
						jQuery("#operation-myoperation-grid-copyTo").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#ea421b" title="严重超时"></span>',{});
						break;
					case '正常':
						jQuery("#operation-myoperation-grid-copyTo").grid('setCell',rowid,'alertStatus','<span class="fa fa-square" style="font-size:16px;margin-left:0px;color:#0085FF" title="正常"></span>',{});
						break;
					};
				}
			});
			$("#operation-myoperation-grid-copyTo").grid("navButtonAdd",[
			    {
			    	title: "严重超时",
			        caption:" 严重超时",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-1"
			    },
			    {
			    	title: "超时",
			        caption:" 超时",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-2"
			    },
			    {
			    	title: "预警",
			        caption:" 预警",
			        buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-3"
			    },
			    {
			    	title: "正常",
			    	caption:" 正常",
			    	buttonicon:"glyphicon glyphicon-stop isaTaskManagement-workOrderState-icon-4"
			    }
			]);
			
		},
		//阅读区
		get_ope_copy_sel_btn: function(page, rowNum, sortname, sortorder) {
			var $form1 = $('#form-copyTo').form('value');
			rowNum = rowNum || this.$("#operation-myoperation-grid-copyTo").grid("getGridParam", "rowNum");
			if(null == page || (typeof page)=="object" ){
				page = 0;
			}
			var map = new Object();
			map.actionStr = "selRedPageWorkorderList";
			var operation_distribute_severity_date_value = document.getElementById("operation_distribute_severity_date_value").value;
			if(""==operation_distribute_severity_date_value){
				map.severityDateValue=100;//告警严重超时时限
			}else{
				map.severityDateValue= operation_distribute_severity_date_value;//告警严重超时时限
			}
			map.createDateStart= $form1.ope_copy_dis_startTime;
			map.createDateEnd= $form1.ope_copy_dis_endTime;
			map.faultKindId= $form1.ope_copy_pro_type;
			map.faultPhenomenaId= $form1.ope_copy_que_type;
			map.faultSourceId= $form1.ope_copy_acc_channel;
			map.faultGradeId= $form1.ope_copy_warn_source;
			map.orderCode= $form1.ope_copy_fau_number;
			map.orderTitle= $form1.ope_copy_fau_title;
			map.limitDateFlag= $form1.ope_copy_fau_limit_date;
			map.staffId = currentUser.staffId;
			map.pageIndex = page;
			map.pageSize = rowNum;
			var me =this;
			utils.ajax('isaOperationFaultService','selRedPageWorkorderList',map).done(function(ret){
				
				$("#operation-myoperation-grid-copyTo").grid("reloadData", ret);
			});
		},
		
		
		
		//派发
		operation_distribute_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/distribute/views/distributeView',
				viewOption:{rowMap:rowMap},
				width: "65%",
				height:500,
				
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyoperationPerData(0,10,1,1);
						//fish.info('派发成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//预处理
		operation_distribute_dis_filing_btn:function(){ 
			
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/preTreatment/views/preTreatmentView',
				
				viewOption:{rowMap:rowMap},
				width: "60%",
				height:300,
				
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyoperationPerData(0,10,1,1);
						//fish.info('转派成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
			
		},
		
		//转派
		operation_trans_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/transpond/views/transpond',
				viewOption:{rowMap:rowMap},
				width: "45%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyoperationPerData(0,10,1,1);
						//fish.info('转派成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		//加派
		operation_adddispatchreason_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！');
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/addDispatchReason/views/addDispatchReason',
				viewOption:{rowMap:rowMap},
				width: "55%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						//getMyoperationPerData(0,10,1,1);
						/*fish.info('派发成功').result.always(function(){
							getMyoperationPerData(0,10,1,1);
							});*/
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		
		//反馈
		operation_feedback_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/feedback/views/feedback',
				viewOption:{rowMap:rowMap},
				width: "55%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						//getMyoperationPerData(0,10,1,1);
						//fish.info('反馈成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		//结单
		operation_finish_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.tacheCode = "YYGZ_PF";
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.workOrderCode = getRowDataTemp.workOrderCode;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/views/finishAutoWorkOrder',
				viewOption:{rowMap:rowMap},
				width: "55%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						//fish.info('回单成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
						getMyoperationPerData(0,10,1,1);
						console.log(e);
					},function (e) {
						getMyoperationPerData(0,10,1,1);
						console.log('关闭了',e);
					});
					
				}
			});
		},
		
		//恢复确认
		operation_recover_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.workOrderCode = getRowDataTemp.workOrderCode;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/recovery/views/recovery',
				viewOption:{rowMap:rowMap},
				width: "55%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyoperationPerData(0,10,1,1);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		
		//退单
		operation_back_order_btn:function(e, rowid, state, checked){
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			}
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.faultOrderId = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.orderId = getRowDataTemp.baseOrderId;
			rowMap.workorderId = getRowDataTemp.id;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.workOrderCode = getRowDataTemp.workOrderCode;
			rowMap.orderTitle= getRowDataTemp.orderTitle;//故障标题：
			rowMap.orderCode= getRowDataTemp.orderCode;//故障编码：
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/backOrder/views/backOrder',
				viewOption:{rowMap:rowMap},
				width: "55%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						getMyoperationPerData(0,10,1,1);
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		//详情
		operation_workOrderInfo_btntab0:function(){
			var  getCheckRows= this.$("#operation-myoperation-grid-pendingtab0").grid("getCheckRows");//返回所有被选中的行
			if (getCheckRows.length!=1) {
				fish.info('请选择单条记录！')
				return;
			};
			getRowDataTemp=getCheckRows[0];
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.processinstanceid = getRowDataTemp.processinstanceid;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
				viewOption:{rowData:rowMap},
				width: "95%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		//详情
		operation_workOrderInfo_btn:function(){
			var getRowDataTemp = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			};
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.processinstanceid = getRowDataTemp.processinstanceid;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
				viewOption:{rowData:rowMap},
				width: "95%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		//详情
		ope_pro_workOrderInfo_btn:function(){
			var getRowDataTemp = this.$("#operation-myoperation-grid-processed").grid("getSelection");//返回所有被选中的行
			if (typeof(getRowDataTemp.id) == "undefined") {
				fish.info('请选择行！')
				return;
			};
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.baseOrderId = getRowDataTemp.id;
			//rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.extStateNameOrder;
			rowMap.processinstanceid = getRowDataTemp.processinstanceid;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
				viewOption:{rowData:rowMap},
				width: "80%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//查看抄送
		ope_pro_workOrderInfo_btn4Copy:function(){
			var udateWorkOrderInfo_btn4Copy = $.proxy(this.udateWorkOrderInfo_btn4Copy,this);
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var rowData = this.$("#operation-myoperation-grid-copyTo").grid("getSelection");//返回所有被选中的行
			var rowMap = new Object();
			rowMap.id = rowData.id;
			rowMap.baseOrderId = rowData.id;
			rowMap.workOrderId = rowData.id;
			rowMap.workStationName = rowData.workStationName;
			rowMap.processinstanceid = rowData.processinstanceid;
			rowMap.faultOrderCopyId = rowData.faultOrderCopyId;
			rowMap.isRead = 1;
			rowMap.staffPhone= currentUser.mobileTel;//电话
			rowMap.orgId = currentJob.orgId;
			rowMap.orgName = currentJob.orgName;
			rowMap.trackOrgName = currentJob.orgName;
			rowMap.jobId = currentJob.jobId;
			rowMap.staffId = currentUser.staffId;
			rowMap.staffName = currentUser.staffName;
			rowMap.actionFlag = "Y";
			rowMap.actionName = "updateFaultOrderCopy";
			rowMap.actionService = "isaOperationFaultService";
			var faultOrderCopyId = rowData.faultOrderCopyId;
    			if(null == rowData.id){
    				fish.info('请选择行！');
    				return;
    			};
    			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
    				viewOption:{rowData:rowMap},
    				width: "80%",
    				callback:function(popup,view){
    					popup.result.then(function (e) {
    						udateWorkOrderInfo_btn4Copy(faultOrderCopyId);
    						getMyoperationPerData(0,10,1,1);
    						console.log(e);
    					},function (e) {
    						console.log('关闭了',e);
    					});
    				}
    			});
		},
		
		//更新抄送查看后的详情
		udateWorkOrderInfo_btn4Copy:function(faultOrderCopyId){
			var me=this;
			var map = new Object();
			map.faultOrderCopyId = faultOrderCopyId;
			map.isRead = 1;
			map.staffPhone= currentUser.mobileTel;//电话
			map.orgId = currentJob.orgId;
			map.orgName = currentJob.orgName;
			map.trackOrgName = currentJob.orgName;
			map.jobId = currentJob.jobId;
			map.staffId = currentUser.staffId;
			map.staffName = currentUser.staffName;
			map.actionStr = "updateFaultOrderCopy";
			utils.ajax('isaOperationFaultService','updateFaultOrderCopy',map).done(function(re){
			});
		},
		
		operation_hangUp_btn:function(){
			var rowData = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(rowData.id) == "undefined") {
				fish.info('请选择行！')
				return;
			};
			
			//判断是否已经申请挂起
			utils.ajax('isaOperationFaultService','hasApplyHangUp',rowData.baseOrderId).done(function(ret){
				if(ret){
					fish.info('已经申请了挂起');
				}else{
					var pop =fish.popupView({
		    			url: 'modules/isa/stoppage/operation/myWorkorderList/applyHangUp/views/applyHangUp',
		    			width: "40%",
		    			viewOption:{rowData:rowData},
		    		});	
				}
			});
			
			
			
		},
		
		operation_upgrade_btn:function(){
			var rowData = this.$("#operation-myoperation-grid-pending").grid("getSelection");//返回所有被选中的行
			if (typeof(rowData.id) == "undefined") {
				fish.info('请选择行！')
				return;
			};
			
			var pop =fish.popupView({
    			url: 'modules/isa/stoppage/operation/myWorkorderList/upGradeNote/views/upGradeNote',
    			width: "30%",
    			viewOption:{rowData:rowData},
    		});	
		},
		
		operation_signIn_btn:function(){
			var  getCheckRows= this.$("#operation-myoperation-grid-pendingtab0").grid("getCheckRows");//返回所有被选中的行
			if (getCheckRows.length<1) {
				fish.info('请选择行');
				return;
			};
			var map=new Object();
			var workOrderIds=new Array();
			var baseOrderIds=new Array();
			for(var i=0;i<getCheckRows.length;i++){
				workOrderIds[i]=getCheckRows[i].id+"";
				baseOrderIds[i]=getCheckRows[i].baseOrderId+"";
			}
			map.workOrderIds=workOrderIds;
			map.baseOrderIds=baseOrderIds;
			map.DISTILL_STAFF_ID=currentUser.staffId;
			map.DISTILL_STAFF_NAME=currentUser.staffName;
			map.DISTILL_ORG_ID=currentJob.orgId;
			map.DISTILL_ORG_NAME=currentJob.orgName
			map.EXT_STATE='2';
			var getMyoperationPerDatatab0=$.proxy(this.getMyoperationPerDatatab0,this);
			utils.ajax('isaOperationFaultService','signIn',map).done(function(ret){
				//刷新数据
				fish.info("签收成功");
				getMyoperationPerDatatab0();
			}).fail(function(ret){
				fish.info("签收失败");
			});
		},
		operation_colse_btntab0: function(){
			var me=this;
			if(document.getElementById("operation_colse_btntab0").value=="0"){
				document.all["operation_colse_sound"].innerHTML="<button type='button' class='btn btn-success' id = 'operation_colse_btntab0' style='margin-left:20px;' value='关闭声音'>关闭声音</button>";
				if(playFlag==-1){
					this.playSound();
				}
				isaMonAutoSum = window.setInterval(function(){
					me.getMyoperationPerDatatab0Count();
				},2*60*1000);
				me.registerThread(isaMonAutoSum);
			}else if(document.getElementById("operation_colse_btntab0").value=="关闭声音"){
				document.all["operation_colse_sound"].innerHTML="<button type='button' class='btn btn-success' id = 'operation_colse_btntab0' style='margin-left:20px;' value='打开声音'>打开声音</button>";
				if(playFlag==1){
					this.stopSound();
				}
				window.clearInterval(isaMonAutoSum);	
			}else{
				document.all["operation_colse_sound"].innerHTML="<button type='button' class='btn btn-success' id = 'operation_colse_btntab0' style='margin-left:20px;' value='关闭声音'>关闭声音</button>";
				if(playFlag==0){
					this.playSound();
				}
				isaMonAutoSum = window.setInterval(function(){
					me.getMyoperationPerDatatab0Count();
				},2*60*1000);
				me.registerThread(isaMonAutoSum);
			}
		},
		getMyoperationPerDatatab0Count:function(){
			var me=this;
			var map=new Object();
			map.orgId = currentJob.orgId;
			map.jobId = currentJob.jobId;
			map.staffId = currentUser.staffId;
			map.dutId = "22";
			map.state = "10A";
			map.extState = "2";
			map.tabNum='1';
			utils.ajax('isaOperationFaultService','selStoppageWorkorderList',map).done(function(ret){
				//刷新数据
				if(ret.records>0&&0==playFlag){
					me.playSound();
				}
				if(0==ret.records&&1==playFlag){
					me.stopSound();
				}
			}).fail(function(ret){
			});
		},
		operation_workOrderInfo_db:function(getRowDataTemp){
			if (getRowDataTemp==undefined) {
				return;
			};
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.baseOrderId;
			rowMap.baseOrderId = getRowDataTemp.baseOrderId;
			rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.workStationName;
			rowMap.processinstanceid = getRowDataTemp.processinstanceid;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
				viewOption:{rowData:rowMap},
				width: "95%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		operation_workOrderInfo_dbtab2:function(getRowDataTemp){
			if (getRowDataTemp==undefined) {
				return;
			};
			var rowMap = new Object();
			rowMap.id = getRowDataTemp.id;
			rowMap.baseOrderId = getRowDataTemp.id;
			//rowMap.workOrderId = getRowDataTemp.id;
			rowMap.workStationName = getRowDataTemp.extStateNameOrder;
			rowMap.processinstanceid = getRowDataTemp.processinstanceid;
			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
				viewOption:{rowData:rowMap},
				width: "80%",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		
		},
		operation_workOrderInfo_dbtab3:function(getRowDataTemp){

			var udateWorkOrderInfo_btn4Copy = $.proxy(this.udateWorkOrderInfo_btn4Copy,this);
			var getMyoperationPerData = $.proxy(this.getMyoperationPerData,this);
			var rowData = getRowDataTemp;//返回所有被选中的行
			var rowMap = new Object();
			rowMap.id = rowData.id;
			rowMap.baseOrderId = rowData.id;
			rowMap.workOrderId = rowData.id;
			rowMap.workStationName = rowData.workStationName;
			rowMap.processinstanceid = rowData.processinstanceid;
			rowMap.faultOrderCopyId = rowData.faultOrderCopyId;
			rowMap.isRead = 1;
			rowMap.staffPhone= currentUser.mobileTel;//电话
			rowMap.orgId = currentJob.orgId;
			rowMap.orgName = currentJob.orgName;
			rowMap.trackOrgName = currentJob.orgName;
			rowMap.jobId = currentJob.jobId;
			rowMap.staffId = currentUser.staffId;
			rowMap.staffName = currentUser.staffName;
			rowMap.actionFlag = "Y";
			rowMap.actionName = "updateFaultOrderCopy";
			rowMap.actionService = "isaOperationFaultService";
			var faultOrderCopyId = rowData.faultOrderCopyId;
    			if(null == rowData.id){
    				fish.info('请选择行！');
    				return;
    			};
    			var pop =fish.popupView({url: 'modules/isa/stoppage/operation/OrderDetails/views/OrderDetailsView',
    				viewOption:{rowData:rowMap},
    				width: "80%",
    				callback:function(popup,view){
    					popup.result.then(function (e) {
    						udateWorkOrderInfo_btn4Copy(faultOrderCopyId);
    						getMyoperationPerData(0,10,1,1);
    						console.log(e);
    					},function (e) {
    						console.log('关闭了',e);
    					});
    				}
    			});
		
		},
	});
});



