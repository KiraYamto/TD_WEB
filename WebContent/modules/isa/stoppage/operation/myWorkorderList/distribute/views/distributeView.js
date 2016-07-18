define([
'text!modules/isa/stoppage/operation/myWorkorderList/distribute/templates/distributeView.html',
'i18n!modules/isa/stoppage/operation/myWorkorderList/distribute/i18n/distribute.i18n',
'modules/common/cloud-utils',
'css!modules/isa/stoppage/operation/myWorkorderList/distribute/styles/distributemanagement.css'
    ], function(ViewTpl, i18n,utils) {
    	return fish.View.extend({
    		filesList: new Array(),
    		rowMap:new Object(),
    		template: fish.compile(ViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {
    			"click #isa_sto_ope_myw_dis_payout_btn": "isa_sto_ope_myw_dis_payout_btn",
    			//"click #isa_sto_ope_myw_dis_filing_btn": "isa_sto_ope_myw_dis_filing_btn",
    			"click #isa_sto_ope_myw_dis_attachmentBtn":"fileUpload",//附件上传
    			"click .deleteFile": "deleteFile",
    			"click #isa_sto_ope_myw_dis_hostIp_qryBtn":"hostIpQryBtn",
    		},

    		initialize: function () {
                this.once('afterRender', $.proxy(this.init, this));
            },

    		init:function(){

    			
    			$("#isa_sto_ope_myw_dis_acceptDate").datetimepicker("disable");
    			
    			//接单人
    			$('#isa_sto_ope_myw_dis_from_party_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择接单人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				//url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrgMuti',
    				showClearIcon:false
    			});
    			
    			
    			//抄送人
    			$('#isa_sto_ope_myw_dis_copy_staff_id').popedit({
    				dataTextField :'text',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500,
    					viewOptions:{
        					title:'选择抄送人',
        					orgId:currentJob.orgPathCode.split('.')[0]
        				},
    				},
    				//url:'js!modules/isa/stoppage/operation/myWorkorderList/views/StaffsbyOrgView',
    				url:'js!modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
    				showClearIcon:false
    			});
    			
    			
    	        
    	        $('#isa_sto_ope_myw_dis_note_type').combobox({
    	            dataSource: [
    	                {"name": "短信", "value": "01"},
    	                {"name": "邮件", "value": "02"},
    	            ],
    	            value: "01",
    	            change: function (event) {
    	                var val = $('#isa_sto_ope_myw_dis_note_type').combobox("value");
    	            }
    	        });
    			
    		},
    		
    		_afterRender: function() {
    			
    			var me =this;
    			
    			var iniObj = this.options;
    			
    			$("#isa_sto_ope_myw_dis_happenTime").datetimepicker({
    				format: 'yyyy/mm/dd hh:ii:ss'
    			});
    			rowMap = iniObj.rowMap;
    			rowMap.actionStr = "selFaultOrderBaseInfo";
    			
    			//查询问题类型
    			utils.ajax('isaOperationFaultService','selFaultOrderBaseInfo',rowMap).done(function(ret){
    				rowMap.createDate = ret[0].createDate;
    				$('#isa_sto_ope_myw_dis_orderCode').val(ret[0].orderCode); //定单编号加载
    				$('#isa_sto_ope_myw_dis_hostIp').val(ret[0].hostIp); //主机ip加载
    				$('#isa_sto_ope_myw_dis_devInfo').val(ret[0].devInfo); //设备加载
    			
    				if (typeof(ret[0].orderTitle) == "undefined") {
    					document.getElementById("isa_sto_ope_myw_dis_orderTitle").value="";
    				}else{
    					document.getElementById("isa_sto_ope_myw_dis_orderTitle").value=ret[0].orderTitle;
    				}
    				document.getElementById("isa_sto_ope_myw_dis_acceptDate").value=ret[0].acceptDate;
    				document.getElementById("isa_sto_ope_myw_dis_happenTime").value=ret[0].faultHappenDate;
    				if (typeof(ret[0].influenceCust) == "undefined") {
    					document.getElementById("isa_sto_ope_myw_dis_influenceCust").value="";
    				}else{
    					document.getElementById("isa_sto_ope_myw_dis_influenceCust").value=ret[0].influenceCust;
    				}
    				if (typeof(ret[0].influenceBusiness) == "undefined") {
    					document.getElementById("isa_sto_ope_myw_dis_influenceBusiness").value="";
    				}else{
    					document.getElementById("isa_sto_ope_myw_dis_influenceBusiness").value=ret[0].influenceBusiness;
    				}
    				if (typeof(ret[0].dealDetail) == "undefined") {
    					document.getElementById("isa_sto_ope_myw_dis_dealDetail").value="";
    				}else{
    					document.getElementById("isa_sto_ope_myw_dis_dealDetail").value=ret[0].dealDetail;
    				}
    				if (typeof(ret[0].faultDesc) == "undefined") {
    					document.getElementById("isa_sto_ope_myw_dis_faultDesc").value="";
    				}else{
    					document.getElementById("isa_sto_ope_myw_dis_faultDesc").value=ret[0].faultDesc;
    				}
    				document.getElementById("isa_sto_ope_myw_dis_acceptDate").value=ret[0].acceptDate;
    				document.getElementById("isa_sto_ope_myw_dis_applyStaffId").value=currentUser.staffName;
    				document.getElementById("isa_sto_ope_myw_dis_faultOrderId").value=ret[0].faultOrderId;
    				$("#isa_sto_ope_myw_dis_limit_finish_time").datetimepicker({
        	            format: 'yyyy/mm/dd hh:ii:ss',
        	            initialDate : ret[0].limitDate
        	        });
    				//document.getElementById("isa_sto_ope_myw_dis_limit_finish_time").value=ret[0].limitDate;
    				document.getElementById("isa_sto_ope_myw_dis_create_date").value=ret[0].createDate;
    				rowMap.applyStaffId=ret[0].applyStaffId;
    				rowMap.faultSourceId=ret[0].faultSourceId;
    				rowMap.faultErmgLevelId=ret[0].faultErmgLevelId;
    				rowMap.faultPhenomenaName=ret[0].faultPhenomenaName;
    				rowMap.faultKindId=ret[0].faultKindId;
    				rowMap.handlePerson=ret[0].handlePerson;
    				rowMap.faultLevel=ret[0].faultLevel;
    				rowMap.faultResPoolId=ret[0].faultResPoolId;
    				rowMap.faultGradeId=ret[0].faultGradeId;
    				rowMap.faultDevTypeId = ret[0].faultDevTypeId;
    				
    				//查询受理渠道
        			utils.ajax('isaFaultService','getFaultSourceById',"2").done(function(ret){
            			$('#isa_sto_ope_myw_dis_faultSourceId').combobox({
            				editable : 'false',
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: ret
        			    });
            			$('#isa_sto_ope_myw_dis_faultSourceId').combobox('value',
            					typeof(rowMap.faultSourceId) == 'undefined'? null:rowMap.faultSourceId.toString());//默认是监控发现
            		});
            		
        			//获得附件id并加载附件
					if(typeof(ret[0].fileId) != 'undefined'){
						var fileIdArr = ret[0].fileId.split(',');
						var fileNameArr = ret[0].fileName.split(',');
						me.filesList = [];//清空
						for (var i=0; i<fileIdArr.length; i++) {
							me.filesList.push({fileId:fileIdArr[i], fileName:fileNameArr[i]});
							utils.ajax('fileService','getFileInfo', fileIdArr[i]).done(function(ret){
								var fileId = ret.id;
								var fileSize = ret.fileSize;
								var filePath = ret.filePath;
								var fileName = ret.fileName;
								var displayFileName = fileName.substr(0, fileName.lastIndexOf('_'));
								fileName = encodeURIComponent(encodeURIComponent(fileName));
								$('<p/>').text(' ● ' + displayFileName + ', 文件大小:' + (fileSize/1024).toFixed(2) + 'KB ')
			                	.append($('<a class="fileUpload-get" href="fileUpload?getFile=' + filePath + fileName + '">下载</a>'))
			                	.append($('<a href="javascript:void(0);" class="deleteFile" style="margin-left: 10px;" file-id="'+fileId+'">删除</a>'))
			                	.appendTo('.attachmentResult4dis');
			                	
							});
						}
					}
        			
        			//获得静态数据
        			utils.ajax('isaCommonService','selStaticData').done(function(ret){
        				//受理渠道
        				var faultSourceDtoList = ret.faultSourceDtoList;
        				//紧急程度
        				var faultErmgLevelDtoList = ret.faultErmgLevelDtoList;
        				//故障分类
        				var faultPhenomenaDtoList = ret.faultPhenomenaDtoList;
        				//产品分类
        				var faultKindDtoList = ret.faultKindDtoList;
        				//障碍类型
        				var faultTypeDtoList = ret.faultTypeDtoList;
        				//平台类型
        				var faultPlatTypeDtoList = ret.faultPlatTypeDtoList;
        				//告警源
        				var faultAlarmSourceDtoList = ret.faultAlarmSourceDtoList;
        				//故障级别
        				var faultGradeDtoList = ret.faultGradeDtoList;
        				//资源池
        				var faultResPoolDtoList = ret.faultResPoolDtoList;
						//设备列表        				
        				var faultDevTypeList = ret.faultDevTypeList;
        				
        				//查询受理渠道
        			/*	$('#isa_sto_ope_myw_dis_faultSourceId').combobox({
            				editable : 'false',
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: faultSourceDtoList,
        			    });*/
        				
        				//紧急程度
        				$('#isa_sto_ope_myw_dis_faultErmgLevelId').combobox({
        					dataTextField: 'name',
        					dataValueField: 'value',
        					dataSource: faultErmgLevelDtoList,
        					value: typeof(rowMap.faultErmgLevelId) == 'undefined'? null:rowMap.faultErmgLevelId.toString()
        				});
        			    //故障分类 
						$('#isa_sto_ope_myw_dis_faultPhenomenaId').popedit({
							dataTextField :'text',
		    				dataValueField :'faultPhenomenaId',
		    				//value: typeof(rowMap.faultPhenomenaId) == 'undefined'? null:rowMap.faultPhenomenaId.toString(),
		    				dialogOption: {
		    					height: 400,
		    					width: 500,
		    					viewOptions:{
		        					title:'选择故障分类',
		        				},
		    				},
		    				open:function(){
		    					var faultKindId = $('#isa_sto_ope_myw_dis_faultKindId').val() || 0;
		    					$("#isa_sto_ope_myw_dis_faultPhenomenaId").data().uiPopedit.popupView.reload(faultKindId);
		    				},
							url:'js!modules/isa/stoppage/operation/common/views/FaultPhenomenaTree',
		    				showClearIcon:false
		    			});
		    			$('#isa_sto_ope_myw_dis_faultPhenomenaId').popedit('setValue',rowMap.faultPhenomenaName);//加载
		    			
        				//查询产品类型
        				$('#isa_sto_ope_myw_dis_faultKindId').combobox({
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: faultKindDtoList,
        			        value: typeof(rowMap.faultKindId) == 'undefined'? null:rowMap.faultKindId.toString()
        			    });
        			    $('#isa_sto_ope_myw_dis_faultKindId').on('combobox:change', function(e) {
							var productClass = $('#isa_sto_ope_myw_dis_faultKindId').combobox('value');
							if(productClass=='15' || productClass=='1' || productClass=='18' || productClass=='16' || productClass=='17'){
								$('#isa_sto_ope_myw_dis_faultResPoolId').combobox('enable', true);
							}else{
        			    		$('#isa_sto_ope_myw_dis_faultResPoolId').combobox('clear');
								$('#isa_sto_ope_myw_dis_faultResPoolId').combobox('disable', true);
							}
						});
        				//障碍级别
        				$('#isa_sto_ope_myw_dis_faultLevel').combobox({
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: faultGradeDtoList,
        			        value: typeof(rowMap.faultGradeId) == 'undefined'? null:rowMap.faultGradeId.toString()
        			    });
        				//资源池
        				$('#isa_sto_ope_myw_dis_faultResPoolId').combobox({
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: faultResPoolDtoList,
        			        value: typeof(rowMap.faultResPoolId) == 'undefined'? null:rowMap.faultResPoolId.toString()
        			    });
        			    //var productClass = rowMap.faultKindId.toString();
        			    var productClass = typeof(rowMap.faultKindId) == 'undefined'? null:rowMap.faultKindId.toString();
        			    if(productClass=='15' || productClass=='1' || productClass=='18' || productClass=='16' || productClass=='17'){
        			    	 //这几个产品要选资源池
        			    }else{
        			    	$('#isa_sto_ope_myw_dis_faultResPoolId').combobox('disable', true);
        			    }
        			    
        			    
        			    //设备列表
        			    $('#isa_sto_ope_myw_dis_faultDevTypeId').combobox({
        			        dataTextField: 'name',
        			        dataValueField: 'value',
        			        dataSource: faultDevTypeList,
        			        value: typeof(rowMap.faultDevTypeId) == 'undefined'? null:rowMap.faultDevTypeId.toString()
        			    });
            		});
    			});
    		},
    		isa_sto_ope_myw_dis_payout_btn:function(){
    			//校验
    			if (!$('#isa_sto_ope_myw_dis_distributeForm').isValid()) { 
    				return;
    			}
    			var popup=this.popup;
    			var $form1 = $('#isa_sto_ope_myw_dis_distributeForm').form('value');
    			var map = new Object();
    			var me=this;
    			limitFinishTime= $form1.isa_sto_ope_myw_dis_limit_finish_time;//要求完成时间
    			createDate= $form1.isa_sto_ope_myw_dis_create_date;//工单创建时间
    			if(this.compareTo(createDate,limitFinishTime)<1){
					fish.info('要求完成时间不能小于工单创建时间'+createDate);
					return;
				}
    			//return;
    			map.workOrderId= rowMap.id;//工单id
    			map.workorderId= rowMap.id;//工单id
    			map.filesList = me.filesList;//上传文件
    			map.faultOrderId= $form1.isa_sto_ope_myw_dis_faultOrderId;//id
    			map.orderId= $form1.isa_sto_ope_myw_dis_faultOrderId;//id
    			map.orderTitle= $form1.isa_sto_ope_myw_dis_orderTitle;//故障标题
    			map.faultSourceId= $form1.isa_sto_ope_myw_dis_faultSourceId;//受理渠道
    			map.faultErmgLevelId= $form1.isa_sto_ope_myw_dis_faultErmgLevelId;//紧急程度
    			map.faultPhenomenaId= $form1.isa_sto_ope_myw_dis_faultPhenomenaId;//故障分类
    			map.faultKindId= $form1.isa_sto_ope_myw_dis_faultKindId;//产品分类
    			map.faultGradeId= $form1.isa_sto_ope_myw_dis_faultLevel;//故障级别
    			map.faultResPoolId= $form1.isa_sto_ope_myw_dis_faultResPoolId;//资源池
    			map.happenTime= $form1.isa_sto_ope_myw_dis_happenTime;//故障发生时间
    			map.influenceCust= $form1.isa_sto_ope_myw_dis_influenceCust;//故障影响客户
    			map.influenceBusiness= $form1.isa_sto_ope_myw_dis_influenceBusiness;//故障影响业务
    			map.dealDetail= $form1.isa_sto_ope_myw_dis_dealDetail;//故障内容
    			map.faultDesc= $form1.isa_sto_ope_myw_dis_faultDesc;//故障内容
    			map.faultDevTypeId = $form1.isa_sto_ope_myw_dis_faultDevTypeId;//设备类型
    			map.devInfo = $form1.isa_sto_ope_myw_dis_devInfo//设备信息
    			map.hostIp = $form1.isa_sto_ope_myw_dis_hostIp//主机ip
    			map.staffPhone= currentUser.mobileTel;//电话
    			map.orgId = currentJob.orgId;
    			map.orgName = currentJob.orgName;
    			map.trackOrgName = currentJob.orgName;
    			map.jobId = currentJob.jobId;
    			map.staffId = currentUser.staffId;
    			map.staffName = currentUser.staffName;
    			map.extState = "10";//定单的状态
    			map.msg ="["+currentUser.staffName+"]派发故障单："+rowMap.orderTitle+"["+rowMap.orderCode+"]";
    			//派发信息
    			var partyData= $('#isa_sto_ope_myw_dis_from_party_id').data('uiPopedit').getValue();//接单人
    			var id=partyData.id;
    			var partyIds=new Array();
    			var partyNames=new Array();
    			var partyTypes=new Array();
    			for(var i=0;i<id.length;i++){
    				if(partyData.type[i] == 2){    //2为人员
    					partyTypes[i] = 'STA';
    					partyIds[i]= id[i]+"";
    				}else if(partyData.type[i] == 1){  //1为职位
    					partyTypes[i]= 'JOB';
    					partyIds[i]= id[i].split('_')[1];
    				}else {
    					partyTypes[i] = 'ORG';    //0为组织
    					partyIds[i]= id[i];
    				}
    				partyNames[i]= partyData.text[i];
    			}
    			map.partyTypes=partyTypes;
    			map.partyIds=partyIds;
    			map.partyNames=partyNames;
    			var copyStaff= $('#isa_sto_ope_myw_dis_copy_staff_id').data('uiPopedit').getValue();//抄送人
    			if (typeof(copyStaff) != "undefined") {
					if(copyStaff.type == 2){    //2为人员
						map.copyStaffType = 'STA';
						map.copyStaffId = copyStaff.id;
					}else if(copyStaff.type == 1){  //1为职位
						map.copyStaffType = 'JOB';
						map.copyStaffId = copyStaff.id.split('_')[1];
					}else {
						map.copyStaffType = 'ORG';    //0为组织
						map.copyStaffId = copyStaff.orgId;
					}
					map.copyStaffName = copyStaff.text;
				}else{
					map.copyStaffType = '';
					map.copyStaffId = '';
					map.copyStaffName = '';
				}
				
				
				map.limitFinishTime = limitFinishTime;
    			var isNote= $form1.isa_sto_ope_myw_dis_is_note;//发送通知
    			if (typeof(isNote) == "undefined"||isNote =='undefined')
    			{
    				isNote = 0;
    			}
    			map.isNote =isNote;
    			if(isNote==1){
    				map.sendType= $('#isa_sto_ope_myw_dis_note_type').combobox("value");//通知方式
        			map.noteContent= $form1.isa_sto_ope_myw_dis_note_content;//发送通知内容
    			}else{
    				map.sendType="";
    				map.noteContent="";
    			}
    			
    			map.actionStr = "distributeWorkOrder";
    			map.faultIsRecover = 0;//障碍是否恢复,0:未恢复 1:已恢复
    			map.operType = 1;//派发
    			map.currentTacheId = 56014001;//当前环节ID
    			map.currentTacheCode = "YYGZ_CL";//当前环节代码
    			map.currentTacheName = "障碍处理";//当前环节名称
    			map.back_order='N';//正向单，
    			map.YYZY_PF_ISPASS='N';//正向单，
    			map.extState = "10";//定单扩展状态
    			utils.ajax('isaOperationFaultService','distributeWorkOrder',map).done(function(e){
    				if(re.flag == '0'){
    					fish.info('派发成功');
    					popup.close();
    				}else{
    					console.log(e);
    					fish.error(e);
    				}
				});
    		},
    		
    		//附件上传
    		fileUpload: function() {
    			var me = this;
    			var uploadedFilesList = []; 
    			
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
    						$.each(e, function(i, file) {
    							me.filesList.push({fileId:file.fileId, fileName:file.fileName});
				                $('<p/>').text(' ● ' + file.fileName + ' 上传成功, 文件大小:' + (file.size/1024).toFixed(2) + 'KB ')
				                	.append($('<a class="fileUpload-get" href="' + file.url + '"file-id="'+file.fileId+'">下载</a>'))
				                	.append($('<a href="javascript:void(0);" class="deleteFile" style="margin-left: 10px;" file-id="'+file.fileId+'">删除</a>'))                     
			                	.appendTo('.attachmentResult4dis');
    							
    						});
    					});
    				}
    			});
    		},
    		
    		/*时间比较
    		-1：endTime小
    		0：时间相等
    		1：endTime大*/
    		compareTo: function (beginTime,endTime){
    	        var beginTimes = beginTime.substring(0,10).split('-');  
    	        var endTimes   =  endTime.substring(0,10).split('-');  
    	        beginTime = beginTimes[1]+'-'+beginTimes[2]+'-'+beginTimes[0]+' '+beginTime.substring(10,19);  
    	        endTime    = endTimes[1]+'-'+endTimes[2]+'-'+endTimes[0]+' '+endTime.substring(10,19);  
    	        var a =(Date.parse(endTime)-Date.parse(beginTime))/60/1000;
    	        if(a<0){  
    	            return -1; 
    	        }else if (a>0){  
    	        	 return 1;  
    	        }else if (a==0){  
    	        	 return 0;  
    	        }  
    	     },
    		
    		deleteFile: function(e) {
    			var me = this;
				e.target.parentElement.parentElement.removeChild(e.target.parentElement);
				me.filesList = _.filter(me.filesList, function(o){return o.fileId != e.target.getAttribute('file-id');});
			},
			
			hostIpQryBtn:function(){
				//fish.info('查询功能尚未开放');
			},
    		
    	});
    });