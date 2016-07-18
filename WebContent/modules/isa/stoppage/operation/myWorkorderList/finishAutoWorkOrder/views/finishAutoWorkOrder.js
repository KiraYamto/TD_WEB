define([
'text!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/templates/finishAutoWorkOrder.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/i18n/finishAutoWorkOrder.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/styles/finishAutoWorkOrder.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		iniFromObj:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_fin_btn": "isa_sto_ope_myw_fin_btn",
    			"click #isa_sto_ope_myw_fin_attachmentBtn":"fileUpload"//附件上传
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){
    			
    			
    			
    		},
    		
    		
    		
    		_afterRender: function() {
    			iniFromObj = this.options;
    			iniFromObj = iniFromObj.rowMap;
    			$("#isa_sto_ope_myw_fin_fault_recover_date").datetimepicker({
    	            format: 'yyyy/mm/dd hh:ii:ss'
    	        });
    			document.getElementById("isa_sto_ope_myw_fin_applyStaffId").value=currentUser.staffName;
    			document.getElementById("isa_sto_ope_myw_fin_applyStaff_phone").value=typeof(currentUser.mobileTel) == 'undefined'? null:currentUser.mobileTel;
    			document.getElementById("isa_sto_ope_myw_fin_apply_org").value=typeof(currentJob.orgName) == 'undefined'?null: currentJob.orgName;
    			document.getElementById("isa_sto_ope_myw_fin_work_order_code").value=iniFromObj.workOrderCode;
    			document.getElementById("isa_sto_ope_myw_fin_work_order_state").value=iniFromObj.workStationName;
    			

    			$('#isa_sto_ope_myw_fin_party').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择处理人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			
    			 //故障分类 
				$('#isa_sto_ope_myw_fin_faultPhenomenaId').popedit({
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
    			var paramMap = new Object();
    			paramMap.faultOrderId = this.options.rowMap.faultOrderId;
    			utils.ajax('isaOperationFaultService','selFaultOrderBaseInfo',paramMap).done(function(ret){
					$('#isa_sto_ope_myw_fin_faultPhenomenaId').popedit('setValue',ret[0].faultPhenomenaName);//加载
    			});
    			
    			
    			utils.ajax('isaOperationFaultService','queFinallyPartyName',iniFromObj).done(function(ret){
    				
    				document.getElementById("isa_sto_ope_myw_fin_party").value=typeof(ret.partyName) == 'undefined'? null:ret.partyName;
    				iniFromObj.partyId=typeof(ret.partyId) == 'undefined'? null:ret.partyId;
    				iniFromObj.partyName=typeof(ret.partyName) == 'undefined'? null:ret.partyName;
    				iniFromObj.partyType = 'STA';
        			//$('#isa_sto_ope_myw_fin_party').popedit("text",ret.partyName,"id",ret.partyId);//默认是监控发现
        		});
    			
    			
    			$('#isa_sto_ope_myw_fin_yyzy_hfqr_ispass').combobox({
    	            dataSource: [
    	                {"name": "是", "value": "Y"},
    	                {"name": "否", "value": "N"},
    	            ],
    	            value: "Y",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_fin_yyzy_hfqr_ispass').combobox("value");
        				if(val == 'Y'){
        					document.getElementById('isa_sto_ope_myw_fin_party_div').style.display="block";
        				}else{
        					document.getElementById('isa_sto_ope_myw_fin_party_div').style.display="none";
        				}
    	            }
    	        });
    			/*$("#isa_sto_ope_myw_fin_yyzy_hfqr_ispass").change(function() {
    				var yyzy_hfqr_ispass = document.getElementById("isa_sto_ope_myw_fin_yyzy_hfqr_ispass").value;
    				if(yyzy_hfqr_ispass == 'Y'){
    					this.$('#isa_sto_ope_myw_fin_party_div').show();
    				}else{
    					this.$('#isa_sto_ope_myw_fin_party_div').hide();
    				}
    			};*/
    			
    		},
    		//提交
    		isa_sto_ope_myw_fin_btn:function(e){
    			var result = $("#isa_sto_ope_myw_fin_from").isValid();
    			if(!result){
    				console.log(result);
    				return;
    			}
    			var me=this;
    			var $form2 = $('#isa_sto_ope_myw_fin_from').form('value');
    			iniFromObj.faultRecoverDate= $form2.isa_sto_ope_myw_fin_fault_recover_date;//故障恢复时间
    			iniFromObj.content= $form2.isa_sto_ope_myw_fin_content;//故障处理描述
    			iniFromObj.dealDetail= $form2.isa_sto_ope_myw_fin_content;//故障处理描述
    			var yyzy_hfqr_ispass= $form2.isa_sto_ope_myw_fin_yyzy_hfqr_ispass;//是否需要恢复确认
    			iniFromObj.fileId= $form2.fileId;//文件id
    			iniFromObj.fileName= $form2.fileName;//文件名
    			iniFromObj.staffPhone= currentUser.mobileTel;//电话
    			iniFromObj.orgId = currentJob.orgId;
    			iniFromObj.yyzy_hfqr_ispass = yyzy_hfqr_ispass;
    			iniFromObj.orgName = currentJob.orgName;
    			iniFromObj.trackOrgName = currentJob.orgName;
    			iniFromObj.jobId = currentJob.jobId;
    			iniFromObj.staffId = currentUser.staffId;
    			iniFromObj.staffName = currentUser.staffName;
    			iniFromObj.actionStr = "finishAutoWorkOrder";
    			iniFromObj.back_order="N";//退单标示
    			iniFromObj.operType = 3;//回单
    			iniFromObj.msg ="["+currentUser.staffName+"]处理故障单："+iniFromObj.orderTitle+"["+iniFromObj.orderCode+"]";
    			iniFromObj.faultPhenomenaId = $form2.isa_sto_ope_myw_fin_faultPhenomenaId;
    			if(yyzy_hfqr_ispass == 'Y'){
    				iniFromObj.extState = "20";//定单的状态
    				var party= me.$('#isa_sto_ope_myw_fin_party').data('uiPopedit').getValue();//恢复确认人
    				if(typeof(party) != 'undefined'){
    					if(party.type == 2){    //2为人员
    						iniFromObj.partyType = 'STA';
    						iniFromObj.partyId = party.id;
    					}else if(party.type == 1){  //1为职位
    						iniFromObj.partyType = 'JOB';
    						iniFromObj.partyId = party.id.split('_')[1];
    					}else {
    						iniFromObj.partyType = 'ORG';    //0为组织
    						iniFromObj.partyId = party.orgId;
    					}
    					iniFromObj.partyName = party.text;
    				}
    				iniFromObj.YYZY_GZCL_HFQR = "Y";
    				iniFromObj.currentTacheId = 56014002;//下一环节ID
    				iniFromObj.currentTacheCode = "YYGZ_HFQR";//下一环节代码
    				iniFromObj.currentTacheName = "恢复确认";//下一环节名称
    			}else{
    				iniFromObj.extState = "60";//定单的状态
    				iniFromObj.partyType = 'STA';
					iniFromObj.partyId = '3527';
					iniFromObj.partyName = '系统体验员';
					iniFromObj.YYZY_GZCL_HFQR = "N";
    				iniFromObj.currentTacheId = 56014003;//下一环节ID
    				iniFromObj.currentTacheCode = "YYGZ_GD";//下一环节代码
    				iniFromObj.currentTacheName = "归档";//下一环节名称
    			}
    			var flag = "N";
    			iniFromObj.flag=flag;
    			fish.confirm("是否入知识库", function(s) {
    					 if (s) {
	       					 flag = "Y";
	    					 iniFromObj.flag=flag;
	       					var pop =fish.popupView({url: 'modules/isa/stoppage/operation/myWorkorderList/finishAutoWorkOrder/views/knowledgeFromView',
	    	    				viewOption:{map:iniFromObj},
	    	    				width: "55%",
	    	    				callback:function(popup,view){
	    	    					popup.result.then(function (e) {
	    	    						//fish.info('回单成功').result.always(function(){getMyoperationPerData(0,10,1,1);});
	    	    						me.popup.close();
	    	    						console.log(e);
	    	    					},function (e) {
	    	    						console.log('关闭了',e);
	    	    					});
	    	    					
	    	    				}
	    	    				
	    	    			});
	       				 }
    					
    				},function(y) {
    					 if (y) {
    						 flag = "N";
        					 iniFromObj.flag=flag;
        					 utils.ajax('isaOperationFaultService','finishAutoWorkOrder',iniFromObj).done(function(re){
    	    					 if(re.flag == '0'){
    	    						 fish.info('回单成功').result.always(function(){me.popup.close()});
    	    					 }else{
    	    						 console.log(e);
    	    						 fish.error(e);
    	    					 }
    	    				 });
    					 }
    					
       				});
    		},
    		//附件上传
    		fileUpload: function() {
    			var uploadedFilesList = [];
    			if($('#isa_sto_ope_myw_fin_attachmentId').val() != ""){
    				var arr = $('#isa_sto_ope_myw_fin_attachmentId').val().split(',');
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
    						$('#isa_sto_ope_myw_fin_attachmentName').val(fileName);
    						$('#isa_sto_ope_myw_fin_attachmentId').val(fileId);
    					});
    				}
    			});
    		}
    		
    		
    		
    	});
    });