define([
'text!modules/isa/stoppage/operation/myWorkorderList/preTreatment/templates/preTreatmentView.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/preTreatment/i18n/preTreatment.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/preTreatment/styles/preTreatment.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		filesList: new Array(),
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_myw_pre_attachmentBtn":"fileUpload",//附件上传
    			"click #isa_sto_myw_pre_sumbitBtn":"isa_sto_myw_pre_sumbitBtn", //确定按钮
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
				
    			$("#isa_sto_myw_pre_recoveryTime").datetimepicker({
    	            format: 'yyyy/mm/dd hh:ii:ss'
    	        });
    	        
    	        //故障分类 
				$('#isa_sto_myw_pre_faultPhenomenaId').popedit({
					dataTextField :'text',
    				dataValueField :'faultPhenomenaId',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择故障分类',
        				},
    				},
					url:'js!modules/isa/stoppage/operation/common/views/FaultPhenomenaTree',
    				showClearIcon:false
    			});
				
				//故障分类    			
    			var rowMap = this.options.rowMap;
    			utils.ajax('isaOperationFaultService','selFaultOrderBaseInfo',rowMap).done(function(ret){
					$('#isa_sto_myw_pre_faultPhenomenaId').popedit('setValue',ret[0].faultPhenomenaName);//加载
    			});
    	        
    		},
    		
    		_afterRender: function() {
    			
    			
    		},
    		
    		
    		//预处理归档
    		isa_sto_myw_pre_sumbitBtn:function(){
    			var me = this;
    			if (!$('#isa_sto_myw_pre_form').isValid()) { 
    				return;
    			}
    			var rowMap = this.options.rowMap;
    			
    			var map = new Object();
    			
    			var $form = $('#isa_sto_myw_pre_form').form('value');
    			map.faultRecoverDate = $form.faultRecoverDate;
    			map.faultPhenomenaId = $form.faultPhenomenaId;
    			map.dealDetail = $form.faultDesc;
    			
    			map.workOrderId= rowMap.workOrderId;//工单id
    			map.workorderId= rowMap.workOrderId;//工单id
    			map.faultOrderId = rowMap.faultOrderId;//障碍单id
    			map.fileId= $('#isa_sto_myw_pre_attachmentId').val();//文件id
    			map.fileName= $('#isa_sto_myw_pre_attachmentName').val();//文件名
    			
    			map.staffPhone= currentUser.mobileTel;//电话
    			map.orgId = currentJob.orgId;
    			map.orgName = currentJob.orgName;
    			map.trackOrgName = currentJob.orgName;
    			map.jobId = currentJob.jobId;
    			map.staffId = currentUser.staffId;
    			map.staffName = currentUser.staffName;
    			map.actionStr = "pretreatmentWorkOrder";
    			map.operType = 1;//派发
    			map.currentTacheId = 56014003;//当前环节ID
    			map.currentTacheCode = "YYGZ_GD";//当前环节代码
    			map.currentTacheName = "归档";//当前环节名称
    			map.extState = "30";//定单的状态
    			map.operType = "25";//操作类型
    			map.msg ="["+currentUser.staffName+"]预处理归档故障单："+rowMap.orderTitle+"["+rowMap.orderCode+"]";
    			utils.ajax('isaOperationFaultService','pretreatmentWorkOrder',map).done(function(re){
    				if(re.flag == '0'){
    					fish.info('预处理成功').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		//附件上传
    		fileUpload: function() {
				var uploadedFilesList = [];
				if($('#isa_sto_myw_pre_attachmentId').val() != ""){
					var arr = $('#isa_sto_myw_pre_attachmentId').val().split(',');
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
							$('#isa_sto_myw_pre_attachmentName').val(fileName);
							$('#isa_sto_myw_pre_attachmentId').val(fileId);
						});
					}
				});
			},
    	
    	});
    });