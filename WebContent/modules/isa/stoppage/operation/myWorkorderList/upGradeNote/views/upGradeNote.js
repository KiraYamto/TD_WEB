define([
'text!modules/isa/stoppage/operation/myWorkorderList/upGradeNote/temlates/upGradeNote.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/upGradeNote/i18n/upGradeNote.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_upGrade_btn": "upGrade_btn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			
    			//通知人
    			$('#isa_sto_ope_myw_notePerson').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择通知人',
        					orgId:currentJob.orgPathCode.split('.')[0],
        				},
    				},
    				url:'js!modules/common/popeditviews/stafforg/views/StaffMultiView',
    				showClearIcon:false,
    				
    			});
    			
    			//通知方式
				$('#isa_sto_ope_myw_noticeWay').combobox();
				
    			
    		},
    		
    		_afterRender: function() {
    			
    			
    		},
    		
    		upGrade_btn:function(){
    			var popup=this.popup;
    			if($('#isa_sto_ope_myw_upGradeForm').isValid()){
    				
    				var paramMap = $('#isa_sto_ope_myw_upGradeForm').form('value');
    				
    				//障碍id
    				paramMap.faultOrderId = this.options.rowData.baseOrderId;
    				//通知人
    				var people = $('#isa_sto_ope_myw_notePerson').data('uiPopedit').getValue();
    				paramMap.staffIds = people.id;
    				//操作人信息
	    			paramMap.trackStaffId = currentUser.staffId;
	    			paramMap.trackStaffName = currentUser.staffName;
	    			paramMap.trackOrgId = currentJob.orgId;
	    			paramMap.trackOrgName = currentJob.orgPathName;
	    			paramMap.trackStaffPhone = currentUser.mobileTel;
	    			paramMap.trackStaffEmail = currentUser.email;
	    			utils.ajax('isaOperationFaultService','urGradeNote',paramMap).done(function(ret){
	    				if(ret == '1'){
	    					fish.info('障碍通知成功');
	    					popup.close();
	    				}else{
	    					fish.error('障碍通知失败');
	    				}
	    				
	        		})
    			}
    		},
    	});
    });