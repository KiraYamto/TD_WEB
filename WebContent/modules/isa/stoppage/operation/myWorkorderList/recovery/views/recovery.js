define([
'text!modules/isa/stoppage/operation/myWorkorderList/recovery/templates/recovery.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/recovery/i18n/recovery.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/recovery/styles/recovery.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_rec_btn": "isa_sto_ope_myw_rec_btn",
    			"click #isa_sto_ope_myw_rec_attachmentBtn": "fileUpload",
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			$('#isa_sto_ope_myw_rec_fault_is_recover').combobox({
    	            dataSource: [
    	                {"name": "未恢复", "value": "0"},
    	                {"name": "已恢复", "value": "1"},
    	            ],
    	            value: "1",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_rec_fault_is_recover').combobox("value");
    	            }
    	        });
    			document.getElementById("isa_sto_ope_myw_rec_org_name").value=currentJob.orgName;
    			document.getElementById("isa_sto_ope_myw_rec_applyStaffId").value= currentUser.staffName;
    			
    		},
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    		},
    		
    		
    		//提交
    		isa_sto_ope_myw_rec_btn:function(){
    			var result = $("#isa_sto_ope_myw_rec_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_rec_from').form('value');
    			faultIsRecover= $form2.isa_sto_ope_myw_rec_fault_is_recover;//障碍是否恢复
    			iniFromObj.faultIsRecover= faultIsRecover;
    			iniFromObj.opinion= $form2.isa_sto_ope_myw_rec_opinion;//确认意见
    			iniFromObj.fileId= $form2.fileId;//附件id
    			iniFromObj.fileName= $form2.fileName;//附件名字
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.orgName = currentJob.orgName;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			iniFromObj.actionStr = "recoveryWorkOrder";
    			iniFromObj.operType = 23;//恢复确认
    			if(faultIsRecover == 1){
    				iniFromObj.extState = "30";//定单的状态
    				iniFromObj.currentTacheId = 56014003;//下一环节ID
    				iniFromObj.currentTacheCode = "YYGZ_GD";//下一环节代码
    				iniFromObj.currentTacheName = "归档";//下一环节名称
    				iniFromObj.YYZY_GZCL_HFQR = "Y";
    				iniFromObj.YYZY_HFQR_ISPASS = "Y";
    				iniFromObj.back_order = "N";
    				iniFromObj.msg ="["+currentUser.staffName+"]故障恢复确认："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			}else{
    				iniFromObj.extState = 10;//定单的状态
    				iniFromObj.currentTacheId = 56014001;//当前环节ID
        			iniFromObj.currentTacheCode = "YYGZ_CL";//当前环节代码
        			iniFromObj.currentTacheName = "障碍处理";//当前环节名称
        			iniFromObj.YYZY_GZCL_HFQR = "Y";
        			iniFromObj.YYZY_HFQR_ISPASS = "N";
        			iniFromObj.back_order = "Y";
        			iniFromObj.msg ="["+currentUser.staffName+"]退回故障单："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			}
    			utils.ajax('isaOperationFaultService','recoveryWorkOrder',iniFromObj).done(function(re){
    				if(re.flag == '0'){
    					fish.info('恢复确认完成').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		//附件上传按钮事件触发的方法
			fileUpload: function() {
				var uploadedFilesList = [];
				if($('#isa_sto_ope_myw_rec_fileId').val() != ""){
					var arr = $('#isa_sto_ope_myw_rec_fileId').val().split(',');
					$.each(arr, function(i, n) {
						uploadedFilesList.push({fileId:n});
					});
				}
				fish.popupView({url: 'modules/common/fileUpload/views/fileUploadView',
					width: "50%",
					viewOption:{ //传给附件上传页面的参数
						moduleName : 'ISA',
						fileType : 'FAULT',
						businessCode : 'OPERATION',
						uploadedFilesList: uploadedFilesList
					},
					callback:function(popup,view){
						popup.result.always(function (e) {//附件上传页面关闭的回调
							var fileName = [];
							var fileId =  [];
							$.each(e, function(i, n) {
								fileName.push(n.fileName);
								fileId.push(n.fileId);
							});
							$('#isa_sto_ope_myw_rec_fileName').val(fileName);
							$('#isa_sto_ope_myw_rec_fileId').val(fileId);
						});
					}
				});
			},
    	});
    });