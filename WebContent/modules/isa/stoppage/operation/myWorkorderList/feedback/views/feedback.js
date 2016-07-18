define([
'text!modules/isa/stoppage/operation/myWorkorderList/feedback/templates/feedback.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/feedback/i18n/feedback.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/feedback/styles/feedback.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_fee_btn": "isa_sto_ope_myw_fee_btn",
    			"click #isa_sto_ope_myw_dis_attachmentBtn":"fileUpload"//附件上传
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			//转派人
    			$('#isa_sto_ope_myw_fee_party_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    				},
    				url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				showClearIcon:false
    			});
    			
    			


    			//获得静态数据
    			utils.ajax('isaCommonService','selStaticData').done(function(ret){
    				//反馈简要
    				var faultTrackReasonList = ret.faultTrackReasonList;
    				//反馈简要
    				$('#isa_sto_ope_myw_fee_trackreason').combobox({
    					dataTextField: 'name',
    					dataValueField: 'value',
    					dataSource: faultTrackReasonList
    				});
        		});
    		},
    		
    		_afterRender: function() {
    			
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    			this.initFeedbackData();
    		},
    		
    		initFeedbackData: function() {
    			this.$("#isa_sto_ope_myw_fee_grid").grid({
    				height: 200,
    				colModel: [{name: 'createDate',width: 60,label: '反馈时间'}, 
    				           {name: 'trackStaffName',label: '反馈人',width: 60},  
    				           {name: 'trackContent',label: '反馈信息',width: 120},  
    				           {name: 'trackMessage',label: '备注',width: 120},  
    				           {name: 'fileName',label: '附件',width: 80} ,
    				           {name: 'faultOrderTrackId',width: 10,label: '操作信息标识',hidden:true}
    				           ],
    				rowNum: 10,
    				pager: true,
    				data:this.getFeedbackData(),
    				afterInsertRow: function(e, rowid, aData){
    					jQuery("#isa_sto_ope_myw_fee_grid").grid('fileName',rowid,'opt','<a href="javascript:void(0)" style="text-decoration:underline">下载</a>',{"text-align":"center"})
    				}
    				
    			});
    		},
    		
    		
    		getFeedbackData: function() { //请求服务器获取数据的方法
    			var map = new Object();
    			map.faultOrderId = iniFromObj.faultOrderId;
    			map.operType = 8;
    			
    			utils.ajax('isaOperationFaultService','getFeedbackData',map).done(function(ret){
    				$("#isa_sto_ope_myw_fee_grid").grid("reloadData", ret);
    			});
    		},
    		
    		//提交
    		isa_sto_ope_myw_fee_btn:function(){
    			var result = $("#isa_sto_ope_myw_fee_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_fee_from').form('value');
    			iniFromObj.trackContent= $form2.isa_sto_ope_myw_fee_content;//描述
    			iniFromObj.trackMessage= $form2.isa_sto_ope_myw_fee_message;//操作备注
    			iniFromObj.trackReasonId= $form2.isa_sto_ope_myw_fee_trackreason;//操作简要
    			iniFromObj.fileId= $form2.fileId;//文件id
    			iniFromObj.fileName= $form2.fileName;//文件名
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.orgName = currentJob.orgName;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			iniFromObj.actionStr = "feedBack";
    			iniFromObj.operType = "8";//通知状态有效
    			utils.ajax('isaOperationFaultService','feedBack',iniFromObj).done(function(re){
    				if(re.flag == '0'){
    					fish.info('进度反馈完成').result.always(function(){me.popup.close()});
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		
    		//附件上传
    		fileUpload: function() {
    			var uploadedFilesList = [];
    			if($('#isa_sto_ope_myw_fee_attachmentId').val() != ""){
    				var arr = $('#isa_sto_ope_myw_fee_attachmentId').val().split(',');
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
    						$('#isa_sto_ope_myw_fee_attachmentName').val(fileName);
    						$('#isa_sto_ope_myw_fee_attachmentId').val(fileId);
    					});
    				}
    			});
    		}
    		
    	});
    });