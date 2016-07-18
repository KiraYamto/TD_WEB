define([
'text!modules/isa/stoppage/operation/monitor/templates/applyHangOrder.html',
'i18n!modules/isa/stoppage/operation/monitor/i18n/monitor.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_mon_rejectBtn": "rejectBtn", 
    			"click #isa_sto_ope_mon_hangBtn": "hangBtn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
                
            },

    		init:function(){
    			
    			this.$("#isa_sto_ope_mon_applyHangOrderGrid").grid({
    				datatype: "json",
    				height: 400,
    				colModel: [{
    					name: 'ORDER_CODE',
    					label: '任务单编号',
    					width: 110
    				}, {
    					name: 'ORDER_TITLE',
    					width: 110,
    					label: '任务单标题'
    				}, {
    					name: 'APPLY_ORG_NAME',
    					label: '请求部门',
    					width: 80
    				},  {
    					name: 'APPLY_ORG_ID',
    					label: '请求部门id',
    					width: 80,
    					hidden:true
    				},  {
    					name: 'APPLY_STAFF_NAME',
    					label: '请求人',
    					width: 80
    				},  {
    					name: 'APPLY_STAFF_ID',
    					label: '请求人id',
    					hidden:true,
    					width: 80
    				},  {
    					name: 'APPLY_CONTENT',
    					label: '请求描述',
    					width: 80
    				},  {
    					name: 'CREATED_DATE',
    					label: '请求时间',
    					width: 80
    				},  {
    					name: 'EXT_STATE_NAME',
    					label: '任务单状态',
    					width: 80
    				},  {
    					name: 'FAULT_ORDER_APPLY_ID',
    					label: '挂起请求标识',
    					width: 80,
    					hidden:true
    				},  {
    					name: 'id',
    					label: '故障单标识',
    					width: 80,
    					hidden:true
    				},  {
    					name: 'PAUSE_REASON_ID',
    					label: '挂起原因id',
    					width: 80,
    					hidden:true
    				}],
    				rowNum: 10,
    				pager: true,
    				server: true,
    				pageData: this.initApplyHangOrder,
    			});
    			
    			this.initApplyHangOrder(1, 10);
    		},
    		
    		_afterRender: function() {
    			
    		},
    		
    		qryApplyHangOrder:function(){
    			alert('hjw11');
    		},
    		
    		
    		initApplyHangOrder:function(page, rowNum){
    			var paramMap = {};
    			utils.ajax('isaOperationFaultService','qryApplyHangOrder',paramMap,page,rowNum).done(function(ret){
    				$("#isa_sto_ope_mon_applyHangOrderGrid").grid("reloadData", ret);
        		});
    		},
    		
    		
    		rejectBtn:function(){
    			var refreshFunction = this.initApplyHangOrder;
    			var rowData = this.$("#isa_sto_ope_mon_applyHangOrderGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.ORDER_CODE){
    				fish.info('请选择行！');
    				return;
    			}
    			var paramMap = {};
    			paramMap.faultOrderApplyId = rowData.FAULT_ORDER_APPLY_ID;
    			paramMap.faultOrderId = rowData.id;
    			//操作人信息
    			paramMap.trackStaffId = currentUser.staffId;
	    		paramMap.trackStaffName = currentUser.staffName;
	    		paramMap.trackOrgId = currentJob.orgId;
	    		paramMap.trackOrgName = currentJob.orgPathName;
    			paramMap.trackStaffPhone = currentUser.mobileTel;
    			paramMap.trackStaffEmail = currentUser.email;
    			utils.ajax('isaOperationFaultService',"rejectApplyHangOrder", paramMap).done(function(ret){
    				if(ret == '1'){
    					fish.info('驳回成功');
    					refreshFunction(1, 10);
    				}else{
    					fish.error('驳回失败');
    				}
    				
        		});
    		},
    		
    		hangBtn:function(){
    			var refreshFunction = this.initApplyHangOrder;
    			var rowData = this.$("#isa_sto_ope_mon_applyHangOrderGrid").grid("getSelection");//返回所有被选中的行
    			if(null == rowData.ORDER_CODE){
    				fish.info('请选择行！');
    				return;
    			}
    			var pop =fish.popupView({
    				url: 'modules/isa/stoppage/operation/monitor/views/hangUp',
    				width: "45%",
    				viewOption:{rowData:rowData},
    				close:function(){
    					refreshFunction(1, 10);
    				},
    			});
    		}
    		
    		
    	});
    });