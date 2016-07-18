define([
        'text!modules/isa/stoppage/operation/OrderDetails/templates/OrderDetailsView.html'+codeVerP,
        'i18n!modules/isa/stoppage/operation/OrderDetails/i18n/orderDetails.i18n',
        'modules/common/cloud-utils',
        'css!modules/isa/stoppage/operation/OrderDetails/styles/orderDetails.css'+codeVerP
        ], function(AgencyMenegementViewTpl, i18nAgency,utils,css) {
	return fish.View.extend({
		rowMap:new Object(),
		template: fish.compile(AgencyMenegementViewTpl),
		i18nData: fish.extend({}, i18nAgency),
		events: {
		},

		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {

			//初始化scrollspy
			$('#orderdetails-scrollspy').scrollspy({
				target:".navbar-collapse"
			});
			
			//初始化grid
			this.loadWorkOrderInfo();
			this.loadReminderInfo();
			this.loadHangInfo();
			this.loadImplementInfo();
		
			//加载数据
			this.loadFaultOrderBase();
			this.getWorkOrderInfoData();
			this.getReminderInfoData();
			this.getHangInfoData();
			this.getImplementInfoData();
			this.showFlow();
			

			$("#order_basicsinfo_faultSource").combobox("disable");
			$("#order_basicsinfo_faultErmgLevel").combobox("disable");
			//$("#order_basicsinfo_faultPhenomena").combobox("disable");
			$("#order_basicsinfo_faultKind").combobox("disable");
			$("#order_basicsinfo_faultLevel").combobox("disable");
			$("#order_basicsinfo_faultResPool").combobox("disable");
			$("#order_basicsinfo_faultDevTypeId").combobox("disable");
			
			/*this.$('#orderdetails-tabs-a').show();
			this.$('#orderdetails-tabs-b').hide();
			this.$('#orderdetails-tabs-c').hide();
			this.$('#orderdetails-tabs-d').hide();
			this.$('#orderdetails-tabs-e').hide();
			this.$('#orderdetails-tabs-f').hide();*/
			var actionFlag = this.options.rowData.actionFlag;
			if('Y' == actionFlag){
				this.udateWorkOrderInfo_btn4Copy(this.options.rowData);
			};
			
		},
	
		
		loadFaultOrderBase:function(){
			var map = new Object();
			map.className = "isaOperationFaultService";
			map.actionStr = "selFaultOrderBaseInfo";
			map.faultOrderId = this.options.rowData.id;
			map.processinstanceid = this.options.rowData.processinstanceid;
			document.getElementById("order_basicsinfo_baseOrderId").value=map.faultOrderId;
			document.getElementById("order_basicsinfo_processinstanceid").value=map.processinstanceid;
			var me =this;
			utils.ajax('isaOperationFaultService','selFaultOrderBaseInfo',map).done(function(ret)	{
			
				$('#order_basicsinfo_orderCode').val(ret[0].orderCode); //定单编号加载
				$('#order_basicsinfo_hostIp').val(ret[0].hostIp); //主机ip加载
    			$('#order_basicsinfo_devInfo').val(ret[0].devInfo); //设备加载
			
				if (typeof(ret[0].orderTitle) == "undefined") {
					document.getElementById("order_basicsinfo_orderTitle").value="";
				}else{
					document.getElementById("order_basicsinfo_orderTitle").value=ret[0].orderTitle;
				}
				document.getElementById("order_basicsinfo_acceptDate").value=ret[0].acceptDate;
				document.getElementById("order_basicsinfo_happenTime").value=ret[0].faultHappenDate;
				if (typeof(ret[0].influenceCust) == "undefined") {
					document.getElementById("order_basicsinfo_influenceCust").value="";
				}else{
					document.getElementById("order_basicsinfo_influenceCust").value=ret[0].influenceCust;
				}
				if (typeof(ret[0].influenceBusiness) == "undefined") {
					document.getElementById("order_basicsinfo_influenceBusiness").value="";
				}else{
					document.getElementById("order_basicsinfo_influenceBusiness").value=ret[0].influenceBusiness;
				}
				if (typeof(ret[0].faultDesc) == "undefined") {
					document.getElementById("order_basicsinfo_faultDesc").value="";
				}else{
					document.getElementById("order_basicsinfo_faultDesc").value=ret[0].faultDesc;
				}
				document.getElementById("order_basicsinfo_acceptDate").value=ret[0].acceptDate;
				document.getElementById("order_basicsinfo_acceptStaffName").value=currentUser.staffName;
			
			var rowMap=new Object();
			rowMap.applyStaffId=ret[0].applyStaffId;
			rowMap.faultSourceId=ret[0].faultSourceId;
			rowMap.faultErmgLevelId=ret[0].faultErmgLevelId;
			rowMap.faultPhenomenaId=ret[0].faultPhenomenaId;
			rowMap.faultPhenomenaName = ret[0].faultPhenomenaName;
			rowMap.faultKindId=ret[0].faultKindId;
			rowMap.handlePerson=ret[0].handlePerson;
			rowMap.faultLevel=ret[0].faultLevel;
			rowMap.faultResPoolId=ret[0].faultResPoolId;
			rowMap.faultGradeId=ret[0].faultGradeId;
			rowMap.faultDevTypeId = ret[0].faultDevTypeId;
			
			//获得附件id并加载附件
			if(typeof(ret[0].fileId) != 'undefined'){
				var fileIdArr = ret[0].fileId.split(',');
				for (var i=0; i<fileIdArr.length; i++) {
					utils.ajax('fileService','getFileInfo', fileIdArr[i]).done(function(ret){
						var fileId = ret.id;
						var fileSize = ret.fileSize;
						var filePath = ret.filePath;
						var fileName = ret.fileName;
						var displayFileName = fileName.substr(0, fileName.lastIndexOf('_'));
						fileName = encodeURIComponent(encodeURIComponent(fileName));
						$('<p/>').text(' ● ' + displayFileName + ', 文件大小:' + (fileSize/1024).toFixed(2) + 'KB ')
						.append($('<a class="fileUpload-get" href="fileUpload?getFile=' + filePath + fileName + '">下载</a>'))
						.appendTo('.attachmentResult');
					});
				}
			}
			
			

			
			//获得静态数据
				
				//查询受理渠道
    			utils.ajax('isaFaultService','getFaultSourceById',"2").done(function(ret){
        			$('#order_basicsinfo_faultSource').combobox({
        				editable : 'false',
    			        dataTextField: 'name',
    			        dataValueField: 'value',
    			        dataSource: ret
    			    });
        			$('#order_basicsinfo_faultSource').combobox('value',
        					typeof(rowMap.faultSourceId) == 'undefined'? null:rowMap.faultSourceId.toString());//默认是监控发现
        		});
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
					//设备类型
					var faultDevTypeList = ret.faultDevTypeList;
					
					//查询受理渠道
					/*$('#order_basicsinfo_faultSource').combobox({
	    				editable : 'false',
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: faultSourceDtoList,
				        value: rowMap.faultSourceId.toString(),
				    });*/
					
					//紧急程度
					$('#order_basicsinfo_faultErmgLevel').combobox({
						dataTextField: 'name',
						dataValueField: 'value',
						dataSource: faultErmgLevelDtoList,
						value: typeof(rowMap.faultErmgLevelId) == 'undefined'? null:rowMap.faultErmgLevelId.toString()
					});
					//故障分类
					$('#order_basicsinfo_faultPhenomena').popedit({
				    });
				    $('#order_basicsinfo_faultPhenomena').popedit('setValue',rowMap.faultPhenomenaName);//加载
				    $('#order_basicsinfo_faultPhenomena').popedit('disable',true);//不可用
				    
					//查询产品类型
					$('#order_basicsinfo_faultKind').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: faultKindDtoList,
				        value: typeof(rowMap.faultKindId) == 'undefined'? null:rowMap.faultKindId.toString()
				    });
					//障碍级别
					$('#order_basicsinfo_faultLevel').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: faultGradeDtoList,
				        value: typeof(rowMap.faultGradeId) == 'undefined'? null:rowMap.faultGradeId.toString()
				    });
					//资源池
					$('#order_basicsinfo_faultResPool').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: faultResPoolDtoList,
				        value: typeof(rowMap.faultResPoolId) == 'undefined'? null:rowMap.faultResPoolId.toString()
				    });
				    //设备类型
				    $('#order_basicsinfo_faultDevTypeId').combobox({
				        dataTextField: 'name',
				        dataValueField: 'value',
				        dataSource: faultDevTypeList,
				        value: typeof(rowMap.faultDevTypeId) == 'undefined'? null:rowMap.faultDevTypeId.toString()
				    });
	    		});
			});
		},
		
		/*工单信息*/
		loadWorkOrderInfo: function() {
			$("#isa_sto_ope_ord_grid_workOrderInfo").grid({
				colModel: [
				    {name: 'dispOrgName', width:150,label: '派发组织'}, 
				    {name: 'dispStaffName', width:150,label: '派发人'}, 
				    {name: 'createDate', width:150,label: '派发时间'},
				    {name: 'partyName', width:150,label: '处理人'},
				    {name: 'tacheName', width:150,label: '环节'},
				    {name: 'extStateName', width:150,label: '处理状态'},
				    {name: 'limitValue', width:150,label: '时限(分钟)'},
				    {name: 'limitDate', width:150,label: '截止时间'},
				    {name: 'staffName', width:150,label: '回单人'},
				    {name: 'finishDate', width:150,label: '回单时间'},
				    {name: 'workOrderId', width:150,label: '工单id', key:true,hidden:true}
				],
				datatype: "json",
				height: 250,
				rowNum: 10,
				pager: true,
				shrinkToFit: false,
		        pageData: this.getWorkOrderInfoData,
				cmTemplate:{sortable: false}
			});
		},
		
		
		/*请求工单信息*/
		getWorkOrderInfoData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sto_ope_ord_grid_workOrderInfo").grid("getGridParam", "rowNum");
			var map = new Object();
			map.className = "isaOperationFaultService";
			map.actionStr = "selWorkOrderAndWorkOrderDetailInfo";
			if (typeof(this.options.rowData) == "undefined") {
				map.baseOrderId = document.getElementById("order_basicsinfo_baseOrderId").value;
			}else{
				map.baseOrderId = this.options.rowData.id;
			}
			map.pageIndex = page;
			map.pageSize = 10;
			var me =this;
			utils.ajax('isaOperationFaultService','selWorkOrderAndWorkOrderDetailInfo',map).done(function(retWorkOrder){
				//
				$("#isa_sto_ope_ord_grid_workOrderInfo").grid("reloadData", retWorkOrder);
			});
		},
		
		
		/*执行信息*/
		loadImplementInfo: function() {
			$("#isa_sto_ope_ord_grid_implementInfo").grid({
				colModel: [
		           {name: 'trackOrgName', width:100,label: '执行组织'}, 
		           {name: 'trackStaffName', width:100,label: '执行人'}, 
		           {name: 'createDate', width:100,label: '执行时间'},
		           {name: 'operTypeName', width:150,label: '操作类型'},
		           {name: 'trackContent', width:250,label: '操作描述'},
		           {name: 'trackMessage', width:350,label: '备注'},
		           {name: 'fileId', width:350,label: '附件id', hidden:true},
		           {name: 'fileName', width:350,label: '附件'},
		           {name: 'faultOrderTrackId', width:150,label: '执行id', key:true,hidden:true}
		           ],
		           datatype: "json",
		           height: 350,
		           rowNum: 10,
					pager: true,
					shrinkToFit: false,
			        pageData: this.getImplementInfoData,
		           cmTemplate:{sortable: false},
		           gridview : false,
		           afterInsertRow : function( e, rowid, data ){
		           		//拼附件，展示下载
		           		var fileData = data.fileId;
		           		var result = ""; 
		           		if(typeof(fileData) != 'undefined'){
		           			for(var i=0; i<fileData.length; i++){
		           				
		           				var fileId = fileData[i].fileId;
								var fileSize = fileData[i].fileSize;
								var filePath = fileData[i].filePath;
								var fileName = fileData[i].fileName;
								var displayFileName = fileName.substr(0, fileName.lastIndexOf('_'));
								fileName = encodeURIComponent(encodeURIComponent(fileName));
								
		           				//result += ' ● ' + displayFileName + ', 文件大小:' + (fileSize/1024).toFixed(2) + 'KB '+'<a class="fileUpload-get" href="fileUpload?getFile=' + filePath + fileName + '">下载</a><br/>'
		           				result += ' ● <a class="fileUpload-get" href="fileUpload?getFile=' + filePath + fileName + '">'+displayFileName+'</a><br/>'
		           			}
		           			
			           		$("#isa_sto_ope_ord_grid_implementInfo").jqGrid('setCell',rowid,'fileName',
				            			result);
		           		}
		           		
		           },
		           
			});
		},

		/*执行信息*/
		getImplementInfoData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sto_ope_ord_grid_implementInfo").grid("getGridParam", "rowNum");
			var map = new Object();
			map.className = "isaOperationFaultService";
			map.actionStr = "selFaultOrderTrack";
			if (typeof(this.options.rowData) == "undefined") {
				map.faultOrderId = document.getElementById("order_basicsinfo_baseOrderId").value;
			}else{
				map.faultOrderId = this.options.rowData.id;
			}
			var me =this;
			map.pageIndex = page;
			map.pageSize = 10;
			utils.ajax('isaOperationFaultService','selFaultOrderTrack',map).done(function(retFaultOrderTrack){
				//
				$("#isa_sto_ope_ord_grid_implementInfo").grid("reloadData", retFaultOrderTrack);
				
			});
		},
		
		/*挂起信息*/
		loadHangInfo: function() {
			$("#isa_sto_ope_ord_grid_hangInfo").grid({
				colModel: [
		           {name: 'pauseOrgName', width:100,label: '挂起组织'}, 
		           {name: 'pauseStaffName', width:100,label: '挂起人'}, 
		           {name: 'pauseReason', width:150,label: '挂起原因'},
		           {name: 'createdDate', width:100,label: '挂起时间'},
		           {name: 'pauseTime', width:100,label: '预计解挂时间'},
		           {name: 'pauseContent', width:200,label: '挂起描述'},
		           {name: 'activationOrgName', width:100,label: '解挂部门'},
		           {name: 'activationStaffName', width:100,label: '解挂人'},
		           {name: 'pauseEndDate', width:100,label: '解挂时间'},
		           {name: 'unpauseReason', width:200,label: '解挂原因'},
		           {name: 'faultOrderTrackId', width:150,label: '故障挂起标识', key:true,hidden:true}
		           ],
		           datatype: "json",
		           height: 250,
		           rowNum: 10,
					pager: true,
					shrinkToFit: false,
			        pageData: this.getHangInfoData,
		           cmTemplate:{sortable: false}
			});
		},
		
		/*挂起信息*/
		getHangInfoData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sto_ope_ord_grid_hangInfo").grid("getGridParam", "rowNum");
			var map = new Object();
			map.className = "isaOperationFaultService";
			map.actionStr = "queFaultOrderPause";
			if (typeof(this.options.rowData) == "undefined") {
				map.faultOrderId = document.getElementById("order_basicsinfo_baseOrderId").value;
			}else{
				map.faultOrderId = this.options.rowData.id;
			}
			var me =this;
			map.pageIndex = page;
			map.pageSize = 10;
			utils.ajax('isaOperationFaultService','queFaultOrderPause',map).done(function(retFaultOrderPause){
				//
				$("#isa_sto_ope_ord_grid_hangInfo").grid("reloadData", retFaultOrderPause);
			});
		},
		
		/*催单信息*/
		loadReminderInfo: function() {
			$("#isa_sto_ope_ord_grid_reminderInfo").grid({
				colModel: [
		           {name: 'urgeOrgName', width:150,label: '催单组织'}, 
		           {name: 'urgeStaffName', width:150,label: '催单人'}, 
		           {name: 'createDate', width:150,label: '催单时间'},
		           {name: 'urgeType', width:150,label: '催单类型'},
		           {name: 'urgeContent', width:450,label: '催单描述'},
		           {name: 'faultOrderUrgeId', width:150,label: '催单标识', key:true,hidden:true}
		           ],
		           datatype: "json",
		           height: 250,
		           rowNum: 10,
					pager: true,
					shrinkToFit: false,
			        pageData: this.getReminderInfoData,
		           cmTemplate:{sortable: false}
			});
		},

		/*催单信息*/
		getReminderInfoData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#isa_sto_ope_ord_grid_reminderInfo").grid("getGridParam", "rowNum");
			var map = new Object();
			map.className = "isaOperationFaultService";
			map.actionStr = "queFaultOrderPause";
			if (typeof(this.options.rowData) == "undefined") {
				map.faultOrderId = document.getElementById("order_basicsinfo_baseOrderId").value;
			}else{
				map.faultOrderId = this.options.rowData.id;
			}
			map.pageIndex = page;
			map.pageSize = 10;
			var me =this;
			utils.ajax('isaOperationFaultService','queFaultOrderUrge',map).done(function(retFaultOrderUrge){
				//
				$("#isa_sto_ope_ord_grid_reminderInfo").grid("reloadData", retFaultOrderUrge);
			});
		},
		
		showFlow:function(){
			var map = new Object();
			map.className = "isaCommonService";
			map.actionStr = "queUosConfig";
			map.name = "FLOW_INST_IP";
			map.pageIndex = 0;
			map.pageSize = 10;
			var me =this;
			utils.ajax('isaCommonService','queUosConfig',map).done(function(retFlow){
				var ipAndPort = retFlow.rows[0].value;
				var processinstanceid = document.getElementById("order_basicsinfo_processinstanceid").value;
				var url = './modules/isa/stoppage/operation/OrderDetails/shadowFlow.html?processInstanceId='+processinstanceid;
				/*var iframe = $('<iframe src="'+url+'" id="flowMonitor-frame" width="98%"  height="400"  frameborder="0" scrolling="hidden"></iframe>');
				
				$('#orderdetails-tabs-f').append(iframe);*/
				
				var flowhtml = '<div class="row"><div class="col-md-12">'
					+'<div class="row">'
					+'<h5 class="col-md-12">流程图</h5>'
					+'<div class="col-md-12"  onload="this.height=400">'
					//+'<iframe src="http://'+ipAndPort+'/uos-manager/flowInst.html?processInstId=' + processinstanceid + '" width="100%"  height="880" frameborder="0" scrolling="auto"></iframe>'
					+'<iframe src="'+url+'" width="100%"  height="400" frameborder="0" scrolling="auto"></iframe>'
					+'</div></div></div></div>';
				document.getElementById('orderdetails-tabs-f').innerHTML=flowhtml;
			});
		},
		//更新抄送查看后的详情
		udateWorkOrderInfo_btn4Copy:function(map){
			var me=this;
			map.actionStr = "updateFaultOrderCopy";
			
			utils.ajax('isaOperationFaultService','updateFaultOrderCopy',map).done(function(re){
				
			});
		},
	});
});