define([
'text!modules/isa/stoppage/operation/monitor/templates/urgeOrder.html',
'i18n!modules/isa/stoppage/operation/monitor/i18n/monitor.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_mon_urgeOrderSubmitBtn": "urgeOrderSubmitBtn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
                
            },

    		init:function(){
    		
    			//默认当前操作人
				$('#isa_sto_ope_mon_urgeStaffId').val(currentUser.staffName);
    			
    			//催单人
    			$('#isa_sto_ope_mon_urgeStaffId').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择催单人',
        					orgId:currentJob.orgPathCode.split('.')[0],
        				},
    				},
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false,
    				
    			});
    			
    			//通知方式
    			$('#isa_sto_ope_mon_noticeWay').combobox();
    			
    		},
    		
    		_afterRender: function() {
    			
    		},
    		
    		urgeOrderSubmitBtn:function(){
    			var popup=this.popup;
    			var rowData = this.options.rowData;
    			var paramMap = $('#isa_sto_ope_mon_urgeOrderForm').form('value');
    			paramMap.faultOrderId = rowData.id;//障碍单ID
    			paramMap.partyId = rowData.PARTYID;//被催单人id
    			//判断催单类型FAULT_ORDER_URGE.URGE_TYPE
    			var nowDate = fish.dateutil.format(new Date(), 'yyyy-mm-dd hh:mm:ss');
    			if(nowDate < rowData.ALERT_DATE){	//0 ： 当前时间小于alram_date
    				paramMap.urgeType = "0";	
    			}else if(nowDate >= rowData.LIMIT_DATE){ //大于等于limit_date 为2
    				paramMap.urgeType = "2";
    			}else{						//大于等于alram_date 小于limit_date为 1
    				paramMap.urgeType = "1";
    			}
    			
    			//操作人信息
    			paramMap.trackStaffId = currentUser.staffId;
    			paramMap.trackStaffName = currentUser.staffName;
    			paramMap.trackOrgId = currentJob.orgId;
    			paramMap.trackOrgName = currentJob.orgPathName;
    			debugger;
    			//催单人信息
    			var urgeOrderMan = $('#isa_sto_ope_mon_urgeStaffId').data('uiPopedit').getValue();
    			if(typeof(urgeOrderMan) == "undefined"){  //使用当前操作人
    				paramMap.urgeOrgId = currentJob.jobId;
	    			paramMap.urgeOrgName = currentJob.orgName;
	    			paramMap.urgeStaffId = currentUser.staffId;
	    			paramMap.urgeStaffName = currentUser.staffName;
    			}else{
    				paramMap.urgeOrgId = urgeOrderMan.orgId;
	    			paramMap.urgeOrgName = urgeOrderMan.orgName;
	    			paramMap.urgeStaffId = urgeOrderMan.id;
	    			paramMap.urgeStaffName = urgeOrderMan.text;
    			}
    			
    			utils.ajax('isaOperationFaultService','urgeOrder',paramMap).done(function(ret){
    				if(ret == '1'){
    					fish.info('人工催单成功');
    					popup.close();
    				}else{
    					fish.error('人工催单失败');
    				}
    				
        		})
    		}
    		
    	});
    });