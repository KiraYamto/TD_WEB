define([
    	'text!modules/isa/stoppage/operation/artiAccept/templates/artiAccept.html',
    	'i18n!modules/isa/stoppage/operation/artiAccept/i8n/artiAccept.i18n',
    	'modules/common/cloud-utils'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		
    		events: {
    			"click #isa_sto_arti_submitBtn": "createOperationFault",
    			"click #isa_sto_arti_cancelBtn": "cancleBtn",
    			"click #isa_sto_ope_attachmentBtn":"fileUpload",
    			"click #isa_sto_ope_hostIp_qryBtn":"hostIpQryBtn",
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },
            
            getFaultKindId:function(){
				return $('#isa_sto_ope_productClass').val();
			},

    		init:function(){
    			
    			var f = $.proxy(this.getFaultKindId, this);
    			
    			//form初始化 isa_sto_ope_AcceptForm
    			$("#isa_sto_ope_AcceptForm").form({
    				validate : 1
    			}); 
    			
    			//受理人员
    			document.getElementById("isa_sto_ope_acceptancePerson").value=currentUser.staffName;
    			//受理时间
    			$("#isa_sto_ope_acceptanceTime").datetimepicker({
    				initialDate:new Date()
    		    }); 
    			$("#isa_sto_ope_acceptanceTime").datetimepicker("disable");
    			
    			//受理渠道
    			utils.ajax('isaFaultService','getFaultSourceById',"2").done(function(ret){
        			$('#isa_sto_ope_acceptanceChannel').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        			$('#isa_sto_ope_acceptanceChannel').combobox('value', '13');//默认是监控发现
        		});
    			
    			//紧急程度
    			utils.ajax('isaCommonService','getStaticData',"fault_ERMG_LEVEL", "FAULT_ERMG_LEVEL_NAME", "FAULT_ERMG_LEVEL_ID").done(function(ret){
        			$('#isa_sto_ope_urgency').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			//故障分类 
				$('#isa_sto_ope_faultClass').popedit({
					dataTextField :'text',
    				dataValueField :'faultPhenomenaId',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择故障分类',
        					//faultKindId:$.proxy(function(){return 1;},this);
        					
        				},
    				},
    				open:function(){
    					var faultKindId = $('#isa_sto_ope_productClass').val() || 0;
    					$("#isa_sto_ope_faultClass").data().uiPopedit.popupView.reload(faultKindId);
    				},
					url:'js!modules/isa/stoppage/operation/common/views/FaultPhenomenaTree',
    				showClearIcon:false
    			});


    			
    			//产品分类
    			utils.ajax('isaCommonService','getStaticData','fault_kind', 'FAULT_KIND_NAME', 'FAULT_KIND_ID').done(function(ret){
        			$('#isa_sto_ope_productClass').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			$('#isa_sto_ope_productClass').on('combobox:change', function(e) {
					var productClass = $('#isa_sto_ope_productClass').combobox('value');
					if(productClass=='15' || productClass=='1' || productClass=='18' || productClass=='16' || productClass=='17'){
						$('#isa_sto_ope_resourcePool').combobox('enable', true);
					}else{
						$('#isa_sto_ope_resourcePool').combobox('clear');
						$('#isa_sto_ope_resourcePool').combobox('disable', true);
					}
				});
    			
    			//故障发生时间
    			$("#isa_sto_ope_happenTime").datetimepicker({
    		       
    		    }); 
    			
    			//处理人员
    			$('#isa_sto_ope_handlePerson').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
//    					width: '45%',
    					viewOptions:{
        					title:'选择处理人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				
					url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			
    			//障碍级别
    			utils.ajax('isaCommonService','getStaticData',"FAULT_GRADE", "FAULT_GRADE_NAME", "FAULT_GRADE_ID").done(function(ret){
        			$('#isa_sto_ope_faultLevel').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
    			
    			//资源池,从资源接口获得
    			utils.ajax('isaCommonService','getStaticData',"FAULT_RES_POOL", "FAULT_RES_POOL_NAME", "FAULT_RES_POOL_ID").done(function(ret){
        			$('#isa_sto_ope_resourcePool').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
        		$('#isa_sto_ope_resourcePool').combobox('disable', true);
        		
        		//设备类型
    			utils.ajax('isaCommonService','getStaticData',"FAULT_DEV_TYPE", "FAULT_DEV_TYPE_NAME", "FAULT_DEV_TYPE_ID").done(function(ret){
        			$('#isa_sto_ope_faultDevTypeId').combobox({
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        		});
        		
        		utils.ajax('isaFaultService','getOrderCode',currentJob.orgName).done(function(ret){
        			$('#isa_sto_ope_orderCode').val(ret);
        		});
        		
    		},
    		
    		createOperationFault:function(){
    		
    			if ($('#isa_sto_ope_AcceptForm').isValid()) { //校验
    				var paramMap = $('#isa_sto_ope_AcceptForm').form('value');
    				//障碍类型
    				paramMap.faultTypeId = '2';
    				
        			//受理人资料
        			paramMap.acceptStaffId = currentUser.staffId;
        			paramMap.acceptOrgId = currentJob.orgId;
        			paramMap.acceptOrgName = currentJob.orgPathName;
        			
        			//区域信息
					paramMap.areaId = currentJob.areaId;
					paramMap.areaName =currentJob.areaName;
					paramMap.orgName = currentJob.orgName;
					
					//处理人信息
					var handlePerson = $('#isa_sto_ope_handlePerson').data('uiPopedit').getValue();
					if(typeof(handlePerson) != "undefined" && handlePerson != null){
						if(handlePerson.type == 2){    //2为人员
							paramMap.partyType = 'STA';
							paramMap.partyId = handlePerson.id;
						}else if(handlePerson.type == 1){  //1为职位
							paramMap.partyType = 'JOB';
							paramMap.partyId = handlePerson.id.split('_')[1];
						}else {
							paramMap.partyType = 'ORG';    //0为组织
							paramMap.partyId = handlePerson.orgId;
						}
						paramMap.partyName = handlePerson.text;
					}
					//加载遮罩层
					$('#isa_sto_ope_div').blockUI({
		                    message: '受理中'
		                }).data('blockui-content', true);
		            
					
        			utils.ajax('isaOperationFaultService','createOperationFault', paramMap).done(function(ret){
        				
        				//取消遮罩层
        				$('#isa_sto_ope_div').unblockUI().data('blockui-content', false);
			            
            
        				var result = ret.split(":")[0];
        				if(result == '1'){
	        				fish.info('人工受理成功');
	        				$('#isa_sto_ope_AcceptForm').form('clear');
	        				$('#isa_sto_ope_acceptancePerson').val(currentUser.staffName);
	        				$("#isa_sto_ope_acceptanceTime").datetimepicker("value", new Date());
	        				$('#isa_sto_ope_acceptanceChannel').combobox('value', '13');//默认是监控发现
	        				utils.ajax('isaFaultService','getOrderCode',currentJob.orgName).done(function(ret){
			        			$('#isa_sto_ope_orderCode').val(ret);
			        		});
        				}else{
        					fish.error('人工受理失败');
        				}
            		});
    			}
    		},
    		
    		cancleBtn:function(){
    			$('#isa_sto_ope_AcceptForm').form('clear');
	        	$('#isa_sto_ope_acceptancePerson').val(currentUser.staffName);
	        	$("#isa_sto_ope_acceptanceTime").datetimepicker("value", new Date());
	        	$('#isa_sto_ope_acceptanceChannel').combobox('value', '13');//默认是监控发现
	        	utils.ajax('isaFaultService','getOrderCode',currentJob.orgName).done(function(ret){
        			$('#isa_sto_ope_orderCode').val(ret);
        		});
    		},
    		
    		//附件上传按钮事件触发的方法
			fileUpload: function() {
				var uploadedFilesList = [];
				if($('#isa_sto_ope_attachmentId').val() != ""){
					var arr = $('#isa_sto_ope_attachmentId').val().split(',');
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
							$('#isa_sto_ope_attachmentName').val(fileName);
							$('#isa_sto_ope_attachmentId').val(fileId);
						});
					}
				});
			},
			
			hostIpQryBtn:function(){
				//fish.info('查询功能尚未开放');
			},
			
			
			
    	});
    });