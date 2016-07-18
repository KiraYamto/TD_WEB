define([
'text!modules/isa/stoppage/operation/monitor/templates/unPause.html',
'i18n!modules/isa/stoppage/operation/monitor/i18n/monitor.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_mon_unPauseSubmitBtn": "unPauseSubmit"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
                
            },

    		init:function(){
    		
    			$("#isa_sto_ope_mon_unPauseForm").form({
    				validate : 1
    			}); 
    			
    			//带出请求人
    			$('#isa_sto_ope_activationStaffId').val(currentUser.staffName);
    		
    			//挂起原因
    			utils.ajax('isaCommonService','getStaticData','FAULT_UNPAUSE_REASON', 'UNPAUSE_REASON', 'UNPAUSE_REASON_ID').done(function(ret){
        			$('#isa_sto_ope_mon_unPauseReasonId').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			
    			/*//请求解挂人
    			$('#isa_sto_ope_activationStaffId').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择请求解挂人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false,
    				
    			});*/
    			
    			//通知方式
    			$('#isa_sto_ope_mon_noticeWay').combobox();
    			
    		},
    		
    		_afterRender: function() {
    			
    		},
    		
    		unPauseSubmit:function(){
    			if ($('#isa_sto_ope_mon_unPauseForm').isValid()) { //校验
    				var popup=this.popup;
	    			var rowData = this.options.rowData;
	    			var paramMap = $('#isa_sto_ope_mon_unPauseForm').form('value');
	    			
	    			paramMap.faultOrderId = rowData.id;//障碍单ID
	    			paramMap.partyId = rowData.PARTYID;//被催单人id
	    			
	    			//操作人信息
	    			paramMap.trackStaffId = currentUser.staffId;
	    			paramMap.trackStaffName = currentUser.staffName;
	    			paramMap.trackOrgId = currentJob.orgId;
	    			paramMap.trackOrgName = currentJob.orgPathName;
	    			
	    			//解挂人信息
	    			/*var unPauseMan = $('#isa_sto_ope_activationStaffId').data('uiPopedit').getValue();
	    			if(typeof(unPauseMan) == "undefined"){//默认当前操作人
*/	    				paramMap.activationOrgId = currentJob.orgId;
	    				paramMap.activationOrgName = currentJob.orgPathName;
	    				paramMap.activationStaffId = currentUser.staffId;
	    				paramMap.activationStaffName = currentUser.staffName;
	    			/*}else{
	    				paramMap.activationOrgId = unPauseMan.orgId;
	    				paramMap.activationOrgName = unPauseMan.orgName;
	    				paramMap.activationStaffId = unPauseMan.id;
	    				paramMap.activationStaffName = unPauseMan.text;
	    			}*/
	    			
	    			utils.ajax('isaOperationFaultService','dealUnPauseOrder',paramMap).done(function(ret){
	    				if(ret == '1'){
	    					fish.info('解挂成功');
	    					popup.close();
	    				}else{
	    					fish.error('解挂失败');
	    				}
	    				
	        		})
    			}
    		}
    		
    	});
    });