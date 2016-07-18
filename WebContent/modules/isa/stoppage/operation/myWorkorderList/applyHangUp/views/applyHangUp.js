define([
'text!modules/isa/stoppage/operation/myWorkorderList/applyHangUp/templates/applyHangUp.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/applyHangUp/i18n/applyHangUp.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_applyHangUp_btn": "applyHangUpBtn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			
    			//请求类型
				$('#isa_sto_ope_myw_applyType').combobox();
				
				//默认当前用户
				$('#isa_sto_ope_myw_applyPerson').val(currentUser.staffName);
				
				//挂起原因
				utils.ajax('isaCommonService','getStaticData','FAULT_PAUSE_REASON', 'PAUSE_REASON', 'PAUSE_REASON_ID').done(function(ret){
        			$('#isa_sto_ope_myw_app_hangUpReason').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    		},
    		
    		_afterRender: function() {
    			
    			
    		},
    		
    		applyHangUpBtn:function(){
    			var popup=this.popup;
    			if($('#isa_sto_ope_myw_applyHangUpForm').isValid()){
    			
    				var paramMap = $('#isa_sto_ope_myw_applyHangUpForm').form('value');
    				
    				//当前操作人信息
    				paramMap.applyOrgId = currentJob.orgId;
    				paramMap.applyOrgName = currentJob.orgName;
    				paramMap.applyStaffId = currentUser.staffId;
    				paramMap.applyStaffName = currentUser.staffName;
    				paramMap.applyStaffPhone = currentUser.mobileTel;
    				paramMap.applyStaffEmail = currentUser.email;
    				
    				//故障单标识
    				paramMap.faultOrderId = this.options.rowData.baseOrderId;
    				
    				utils.ajax('isaOperationFaultService','dealApplyHangUpOrder', paramMap).done(function(ret){
        				if(ret == '1'){
	        				fish.info('申请挂起成功');
	        				popup.close();
        				}else{
        					fish.error('申请挂起失败');
        				}
            		});
    			}
    		},
    		
    	});
    });