define([
'text!modules/isa/stoppage/operation/monitor/templates/hangUp.html',
'i18n!modules/isa/stoppage/operation/monitor/i18n/monitor.i18n',
'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_mon_hangUpBtn": "hangUpBtn"
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
                
            },

    		init:function(){
    			
    			$("#isa_sto_ope_mon_hangUpGrid").form({
    				validate : 1
    			}); 
    			
    			//带出请求人
    			var rowData = this.options.rowData;
    			if (typeof(rowData.APPLY_STAFF_NAME) == "undefined"){
    				$('#isa_sto_ope_requestHangUpMan').val(currentUser.staffName);
    			}else{
	    			$('#isa_sto_ope_requestHangUpMan').val(rowData.APPLY_STAFF_NAME);
    			}
    			
    			
    			//挂起原因
    			utils.ajax('isaCommonService','getStaticData','FAULT_PAUSE_REASON', 'PAUSE_REASON', 'PAUSE_REASON_ID').done(function(ret){
        			$('#isa_sto_ope_mon_hangUpReason').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret,
    			        value:rowData.PAUSE_REASON_ID == null?null:rowData.PAUSE_REASON_ID.toString(),
    			    });
        		});
    			
    			//预计解挂时间
    			$('#isa_sto_ope_mon_preditcTime').datetimepicker({
    	            //format: 'yyyy/mm/dd hh:ii:ss'
    	            startDate: fish.dateutil.addDays(new Date(), -1),
    	        });
    			
    			//请求挂起人
    			$('#isa_sto_ope_requestHangUpMan').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择请求挂起人',
        					orgId:currentJob.orgPathCode.split('.')[0]
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
    		
    		hangUpBtn:function(){
    			
    			var time = $("#isa_sto_ope_mon_preditcTime").datetimepicker("getDate");
				if(new Date()-time > 0){   //解挂时间不能小于当前时间
					fish.info("解挂时间不能小于当前时间");
					return;
				}
    			
    			if($('#isa_sto_ope_mon_hangUpGrid').isValid()) { //校验
	    			var popup=this.popup;
	    			var rowData = this.options.rowData;
	    			var paramMap = $('#isa_sto_ope_mon_hangUpGrid').form('value');
	    			
	    			paramMap.faultOrderApplyId = rowData.FAULT_ORDER_APPLY_ID;
	    			paramMap.faultOrderId = rowData.id;
	    			paramMap.tacheCode = rowData.TACHE_CODE;
	    			paramMap.tacheName = rowData.TACHE_NAME;
	    			paramMap.partyId = rowData.partyId;//被催单人id
	    			paramMap.partyType = rowData.partyType;//
	    			
	    			//操作人信息
	    			paramMap.trackStaffId = currentUser.staffId;
	    			paramMap.trackStaffName = currentUser.staffName;
	    			paramMap.trackOrgId = currentJob.orgId;
	    			paramMap.trackOrgName = currentJob.orgPathName;
	    			
	    			//申请挂起人信息
	    			var requestHangUpMan = $('#isa_sto_ope_requestHangUpMan').data('uiPopedit').getValue();
	    			if (typeof(requestHangUpMan) == "undefined") { //使用自带的挂起人信息或者默认当前的操作人
	    				if(typeof(rowData.APPLY_STAFF_ID) == "undefined"){//使用默认当前的操作人
	    					paramMap.pauseStaffId = currentUser.staffId;
	    					paramMap.pauseStaffName = currentUser.staffName;
	    					paramMap.pauseOrgId = currentJob.orgId;
	    					paramMap.pauseOrgName = currentJob.orgPathName;
	    				}else{//使用自带的挂起人信息
	    					paramMap.pauseStaffId = rowData.APPLY_STAFF_ID;
	    					paramMap.pauseStaffName = rowData.APPLY_STAFF_NAME;
	    					paramMap.pauseOrgId = rowData.APPLY_ORG_ID;
	    					paramMap.pauseOrgName = rowData.APPLY_ORG_NAME;
	    				}
					}else{//选挂起人
						paramMap.pauseStaffId = requestHangUpMan.id;
	    				paramMap.pauseStaffName = requestHangUpMan.text;
	    				paramMap.pauseOrgId = requestHangUpMan.orgId;
	    				paramMap.pauseOrgName = requestHangUpMan.orgPathName;
					}
	    			
	    			
	    			utils.ajax('isaOperationFaultService','dealHangUpOrder',paramMap).done(function(ret){
	    				if(ret == '1'){
	    					fish.info('挂起成功');
	    					popup.close();
	    				}else{
	    					fish.error('挂起失败');
	    				}
	    				
	        		})
        		
        		}
    		}
    		
    	});
    });